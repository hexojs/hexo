import assert from 'assert';
import moment from 'moment';
import Promise from 'bluebird';
import { join, extname, basename } from 'path';
import { magenta } from 'picocolors';
import { load } from 'js-yaml';
import { slugize, escapeRegExp, deepMerge} from 'hexo-util';
import { copyDir, exists, listDir, mkdirs, readFile, rmdir, unlink, writeFile } from 'hexo-fs';
import { parse as yfmParse, split as yfmSplit, stringify as yfmStringify } from 'hexo-front-matter';
import type Hexo from './index';
import type { NodeJSLikeCallback, RenderData } from '../types';

const preservedKeys = ['title', 'slug', 'path', 'layout', 'date', 'content'];

const rHexoPostRenderEscape = /<hexoPostRenderCodeBlock>([\s\S]+?)<\/hexoPostRenderCodeBlock>/g;
const rSwigTag = /(\{\{.+?\}\})|(\{#.+?#\})|(\{%.+?%\})/s;

const rSwigPlaceHolder = /(?:<|&lt;)!--swig\uFFFC(\d+)--(?:>|&gt;)/g;
const rCodeBlockPlaceHolder = /(?:<|&lt;)!--code\uFFFC(\d+)--(?:>|&gt;)/g;

const STATE_PLAINTEXT = 0;
const STATE_SWIG_VAR = 1;
const STATE_SWIG_COMMENT = 2;
const STATE_SWIG_TAG = 3;
const STATE_SWIG_FULL_TAG = 4;

const isNonWhiteSpaceChar = (char: string) => char !== '\r'
  && char !== '\n'
  && char !== '\t'
  && char !== '\f'
  && char !== '\v'
  && char !== ' ';

class PostRenderEscape {
  public stored: string[];
  public length: number;

  constructor() {
    this.stored = [];
  }

  static escapeContent(cache: string[], flag: string, str: string) {
    return `<!--${flag}\uFFFC${cache.push(str) - 1}-->`;
  }

  static restoreContent(cache: string[]) {
    return (_: string, index: number) => {
      assert(cache[index]);
      const value = cache[index];
      cache[index] = null;
      return value;
    };
  }

  restoreAllSwigTags(str: string) {
    const restored = str.replace(rSwigPlaceHolder, PostRenderEscape.restoreContent(this.stored));
    return restored;
  }

  restoreCodeBlocks(str: string) {
    return str.replace(rCodeBlockPlaceHolder, PostRenderEscape.restoreContent(this.stored));
  }

  escapeCodeBlocks(str: string) {
    return str.replace(rHexoPostRenderEscape, (_, content) => PostRenderEscape.escapeContent(this.stored, 'code', content));
  }

  /**
   * @param {string} str
   * @returns string
   */
  escapeAllSwigTags(str: string) {
    let state = STATE_PLAINTEXT;
    let buffer_start = -1;
    let plain_text_start = 0;
    let output = '';

    let swig_tag_name_begin = false;
    let swig_tag_name_end = false;
    let swig_tag_name = '';

    let swig_full_tag_start_start = -1;
    let swig_full_tag_start_end = -1;
    // current we just consider one level of string quote
    let swig_string_quote = '';

    const { length } = str;

    let idx = 0;

    // for backtracking
    const swig_start_idx = [0, 0, 0, 0, 0];

    const flushPlainText = (end: number) => {
      if (plain_text_start !== -1 && end > plain_text_start) {
        output += str.slice(plain_text_start, end);
      }
      plain_text_start = -1;
    };

    const ensurePlainTextStart = (position: number) => {
      if (plain_text_start === -1) {
        plain_text_start = position;
      }
    };

    const pushAndReset = (value: string) => {
      output += value;
      plain_text_start = -1;
    };

    while (idx < length) {
      while (idx < length) {
        const char = str[idx];
        const next_char = str[idx + 1];

        if (state === STATE_PLAINTEXT) { // From plain text to swig
          ensurePlainTextStart(idx);
          if (char === '{') {
            // check if it is a complete tag {{ }}
            if (next_char === '{') {
              flushPlainText(idx);
              state = STATE_SWIG_VAR;
              idx++;
              buffer_start = idx + 1;
              swig_start_idx[state] = idx;
            } else if (next_char === '#') {
              flushPlainText(idx);
              state = STATE_SWIG_COMMENT;
              idx++;
              buffer_start = idx + 1;
              swig_start_idx[state] = idx;
            } else if (next_char === '%') {
              flushPlainText(idx);
              state = STATE_SWIG_TAG;
              idx++;
              buffer_start = idx + 1;
              swig_full_tag_start_start = idx + 1;
              swig_full_tag_start_end = idx + 1;
              swig_tag_name = '';
              swig_tag_name_begin = false; // Mark if it is the first non white space char in the swig tag
              swig_tag_name_end = false;
              swig_start_idx[state] = idx;
            }
          }
        } else if (state === STATE_SWIG_TAG) {
          if (char === '"' || char === '\'') {
            if (swig_string_quote === '') {
              swig_string_quote = char;
            } else if (swig_string_quote === char) {
              swig_string_quote = '';
            }
          }
          // {% } or {% %
          if (((char !== '%' && next_char === '}') || (char === '%' && next_char !== '}')) && swig_string_quote === '') {
            // From swig back to plain text
            swig_tag_name = '';
            state = STATE_PLAINTEXT;
            pushAndReset(`{%${str.slice(buffer_start, idx)}${char}`);
          } else if (char === '%' && next_char === '}' && swig_string_quote === '') { // From swig back to plain text
            idx++;
            if (swig_tag_name !== '' && str.includes(`end${swig_tag_name}`)) {
              state = STATE_SWIG_FULL_TAG;
              buffer_start = idx + 1;
              // since we have already move idx to next char of '}', so here is idx -1
              swig_full_tag_start_end = idx - 1;
              swig_start_idx[state] = idx;
            } else {
              swig_tag_name = '';
              state = STATE_PLAINTEXT;
              // since we have already move idx to next char of '}', so here is idx -1
              pushAndReset(PostRenderEscape.escapeContent(this.stored, 'swig', `{%${str.slice(buffer_start, idx - 1)}%}`));
            }

          } else {
            if (isNonWhiteSpaceChar(char)) {
              if (!swig_tag_name_begin && !swig_tag_name_end) {
                swig_tag_name_begin = true;
              }

              if (swig_tag_name_begin) {
                swig_tag_name += char;
              }
            } else {
              if (swig_tag_name_begin === true) {
                swig_tag_name_begin = false;
                swig_tag_name_end = true;
              }
            }
          }
        } else if (state === STATE_SWIG_VAR) {
          if (char === '"' || char === '\'') {
            if (swig_string_quote === '') {
              swig_string_quote = char;
            } else if (swig_string_quote === char) {
              swig_string_quote = '';
            }
          }
          // {{ }
          if (char === '}' && next_char !== '}' && swig_string_quote === '') {
            // From swig back to plain text
            state = STATE_PLAINTEXT;
            pushAndReset(`{{${str.slice(buffer_start, idx)}${char}`);
          } else if (char === '}' && next_char === '}' && swig_string_quote === '') {
            pushAndReset(PostRenderEscape.escapeContent(this.stored, 'swig', `{{${str.slice(buffer_start, idx)}}}`));
            idx++;
            state = STATE_PLAINTEXT;
          }
        } else if (state === STATE_SWIG_COMMENT) { // From swig back to plain text
          if (char === '#' && next_char === '}') {
            idx++;
            state = STATE_PLAINTEXT;
            plain_text_start = -1;
          }
        } else if (state === STATE_SWIG_FULL_TAG) {
          if (char === '{' && next_char === '%') {
            let swig_full_tag_end_buffer = '';
            let swig_full_tag_found = false;

            let _idx = idx + 2;
            for (; _idx < length; _idx++) {
              const _char = str[_idx];
              const _next_char = str[_idx + 1];

              if (_char === '%' && _next_char === '}') {
                _idx++;
                swig_full_tag_found = true;
                break;
              }

              swig_full_tag_end_buffer = swig_full_tag_end_buffer + _char;
            }

            if (swig_full_tag_found && swig_full_tag_end_buffer.includes(`end${swig_tag_name}`)) {
              state = STATE_PLAINTEXT;
              pushAndReset(PostRenderEscape.escapeContent(this.stored, 'swig', `{%${str.slice(swig_full_tag_start_start, swig_full_tag_start_end)}%}${str.slice(buffer_start, idx)}{%${swig_full_tag_end_buffer}%}`));
              idx = _idx;
              swig_full_tag_end_buffer = '';
            }
          }
        }
        idx++;
      }
      if (state === STATE_PLAINTEXT) {
        break;
      }
      // If the swig tag is not closed, then it is a plain text, we need to backtrack
      if (state === STATE_SWIG_FULL_TAG) {
        pushAndReset(`{%${str.slice(swig_full_tag_start_start, swig_full_tag_start_end)}%`);
      } else {
        pushAndReset('{');
      }
      idx = swig_start_idx[state];
      swig_string_quote = '';
      state = STATE_PLAINTEXT;
    }

    if (plain_text_start !== -1 && plain_text_start < length) {
      output += str.slice(plain_text_start);
    }

    return output;
  }
}

const prepareFrontMatter = (data: any, jsonMode: boolean): Record<string, string> => {
  for (const [key, item] of Object.entries(data)) {
    if (moment.isMoment(item)) {
      data[key] = item.utc().format('YYYY-MM-DD HH:mm:ss');
    } else if (moment.isDate(item)) {
      data[key] = moment.utc(item).format('YYYY-MM-DD HH:mm:ss');
    } else if (typeof item === 'string') {
      if (jsonMode || item.includes(':') || item.startsWith('#') || item.startsWith('!!')
      || item.includes('{') || item.includes('}') || item.includes('[') || item.includes(']')
      || item.includes('\'') || item.includes('"')) data[key] = `"${item.replace(/"/g, '\\"')}"`;
    }
  }

  return data;
};


const removeExtname = (str: string) => {
  return str.substring(0, str.length - extname(str).length);
};

const createAssetFolder = (path: string, assetFolder: boolean) => {
  if (!assetFolder) return Promise.resolve();

  const target = removeExtname(path);

  if (basename(target) === 'index') return Promise.resolve();

  return exists(target).then(exist => {
    if (!exist) return mkdirs(target);
  });
};

interface Result {
  path: string;
  content: string;
}

interface PostData {
  title?: string | number;
  layout?: string;
  slug?: string | number;
  path?: string;
  date?: moment.Moment;
  [prop: string]: any;
}

class Post {
  public context: Hexo;

  constructor(context: Hexo) {
    this.context = context;
  }

  create(data: PostData, callback?: NodeJSLikeCallback<any>): Promise<Result>;
  create(data: PostData, replace: boolean, callback?: NodeJSLikeCallback<any>): Promise<Result>;
  create(data: PostData, replace: boolean | (NodeJSLikeCallback<any>), callback?: NodeJSLikeCallback<any>): Promise<Result> {
    if (!callback && typeof replace === 'function') {
      callback = replace;
      replace = false;
    }

    const ctx = this.context;
    const { config } = ctx;

    data.slug = slugize((data.slug || data.title).toString(), { transform: config.filename_case });
    data.layout = (data.layout || config.default_layout).toLowerCase();
    data.date = data.date ? moment(data.date) : moment();

    return Promise.all([
      // Get the post path
      ctx.execFilter('new_post_path', data, {
        args: [replace],
        context: ctx
      }),
      this._renderScaffold(data)
    ]).spread((path: string, content: string) => {
      const result = { path, content };

      return Promise.all<void, void | string>([
        // Write content to file
        writeFile(path, content),
        // Create asset folder
        createAssetFolder(path, config.post_asset_folder)
      ]).then(() => {
        ctx.emit('new', result);
        return result;
      });
    }).asCallback(callback);
  }

  _getScaffold(layout: string) {
    const ctx = this.context;

    return ctx.scaffold.get(layout).then(result => {
      if (result != null) return result;
      return ctx.scaffold.get('normal');
    });
  }

  _renderScaffold(data: PostData) {
    const { tag } = this.context.extend;
    let splitted: ReturnType<typeof yfmSplit>;

    return this._getScaffold(data.layout).then(scaffold => {
      splitted = yfmSplit(scaffold);
      const jsonMode = splitted.separator.startsWith(';');
      const frontMatter = prepareFrontMatter({ ...data }, jsonMode);

      return tag.render(splitted.data, frontMatter);
    }).then(frontMatter => {
      const { separator } = splitted;
      const jsonMode = separator.startsWith(';');

      // Parse front-matter
      let obj = jsonMode ? JSON.parse(`{${frontMatter}}`) : load(frontMatter);

      obj = deepMerge(obj, Object.fromEntries(Object.entries(data).filter(([key, value]) => !preservedKeys.includes(key) && value != null)));

      let content = '';
      // Prepend the separator
      if (splitted.prefixSeparator) content += `${separator}\n`;

      content += yfmStringify(obj, {
        mode: jsonMode ? 'json' : ''
      });

      // Concat content
      content += splitted.content;

      if (data.content) {
        content += `\n${data.content}`;
      }

      return content;
    });
  }

  publish(data: PostData, replace?: boolean): Promise<Result>;
  publish(data: PostData, callback?: NodeJSLikeCallback<Result>): Promise<Result>;
  publish(data: PostData, replace: boolean, callback?: NodeJSLikeCallback<Result>): Promise<Result>;
  publish(data: PostData, replace?: boolean | NodeJSLikeCallback<Result>, callback?: NodeJSLikeCallback<Result>): Promise<Result> {
    if (!callback && typeof replace === 'function') {
      callback = replace;
      replace = false;
    }

    if (data.layout === 'draft') data.layout = 'post';

    const ctx = this.context;
    const { config } = ctx;
    const draftDir = join(ctx.source_dir, '_drafts');
    const slug = slugize(data.slug.toString(), { transform: config.filename_case });
    data.slug = slug;
    const regex = new RegExp(`^${escapeRegExp(slug)}(?:[^\\/\\\\]+)`);
    let src = '';
    const result: Result = {} as any;

    data.layout = (data.layout || config.default_layout).toLowerCase();

    // Find the draft
    return listDir(draftDir).then(list => {
      const item = list.find(item => regex.test(item));
      if (!item) throw new Error(`Draft "${slug}" does not exist.`);

      // Read the content
      src = join(draftDir, item);
      return readFile(src);
    }).then(content => {
      // Create post
      Object.assign(data, yfmParse(content));
      data.content = data._content;
      data._content = undefined;

      return this.create(data, replace as boolean);
    }).then(post => {
      result.path = post.path;
      result.content = post.content;
      return unlink(src);
    }).then(() => { // Remove the original draft file
      if (!config.post_asset_folder) return;

      // Copy assets
      const assetSrc = removeExtname(src);
      const assetDest = removeExtname(result.path);

      return exists(assetSrc).then(exist => {
        if (!exist) return;

        return copyDir(assetSrc, assetDest).then(() => rmdir(assetSrc));
      });
    }).thenReturn(result).asCallback(callback);
  }

  render(source: string, data: RenderData = {}, callback?: NodeJSLikeCallback<never>) {
    const ctx = this.context;
    const { config } = ctx;
    const { tag } = ctx.extend;
    const ext = data.engine || (source ? extname(source) : '');

    let promise;

    if (data.content != null) {
      promise = Promise.resolve(data.content);
    } else if (source) {
      // Read content from files
      promise = readFile(source);
    } else {
      return Promise.reject(new Error('No input file or string!')).asCallback(callback);
    }

    // Files like js and css are also processed by this function, but they do not require preprocessing like markdown
    // data.source does not exist when tag plugins call the markdown renderer
    const isPost = !data.source || ['html', 'htm'].includes(ctx.render.getOutput(data.source));

    if (!isPost) {
      return promise.then(content => {
        data.content = content;
        ctx.log.debug('Rendering file: %s', magenta(source));

        return ctx.render.render({
          text: data.content,
          path: source,
          engine: data.engine,
          toString: true
        });
      }).then(content => {
        data.content = content;
        return data;
      }).asCallback(callback);
    }

    // disable Nunjucks when the renderer specify that.
    let disableNunjucks = ext && ctx.render.renderer.get(ext) && !!ctx.render.renderer.get(ext).disableNunjucks;

    // front-matter overrides renderer's option
    if (typeof data.disableNunjucks === 'boolean') disableNunjucks = data.disableNunjucks;

    const cacheObj = new PostRenderEscape();

    return promise.then(content => {
      data.content = content;
      // Run "before_post_render" filters
      return ctx.execFilter('before_post_render', data, { context: ctx });
    }).then(() => {
      data.content = cacheObj.escapeCodeBlocks(data.content);
      // Escape all Nunjucks/Swig tags
      let hasSwigTag = true;
      if (disableNunjucks === false) {
        hasSwigTag = rSwigTag.test(data.content);
        if (hasSwigTag) {
          data.content = cacheObj.escapeAllSwigTags(data.content);
        }
      }

      const options: { highlight?: boolean; } = data.markdown || {};
      if (!config.syntax_highlighter) options.highlight = null;

      ctx.log.debug('Rendering post: %s', magenta(source));
      // Render with markdown or other renderer
      return ctx.render.render({
        text: data.content,
        path: source,
        engine: data.engine,
        toString: true,
        onRenderEnd(content) {
          // Replace cache data with real contents
          data.content = cacheObj.restoreAllSwigTags(content);

          // Return content after replace the placeholders
          if (disableNunjucks || !hasSwigTag) return data.content;

          // Render with Nunjucks if there are Swig tags
          return tag.render(data.content, data);
        }
      }, options);
    }).then(content => {
      data.content = cacheObj.restoreCodeBlocks(content);

      // Run "after_post_render" filters
      return ctx.execFilter('after_post_render', data, { context: ctx });
    }).asCallback(callback);
  }
}

export = Post;
