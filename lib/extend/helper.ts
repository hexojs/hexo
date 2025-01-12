import Hexo from '../hexo';
import { PageSchema } from '../types';
import * as hutil from 'hexo-util';

interface HexoContext extends Hexo {
  // get current page information
  // https://github.com/dimaslanjaka/hexo-renderers/blob/147340f6d03a8d3103e9589ddf86778ed7f9019b/src/helper/related-posts.ts#L106-L113
  page?: PageSchema;

  // hexo-util shims
  url_for: typeof hutil.url_for;
  full_url_for: typeof hutil.full_url_for;
  relative_url: typeof hutil.relative_url;
  slugize: typeof hutil.slugize;
  escapeDiacritic: typeof hutil.escapeDiacritic;
  escapeHTML: typeof hutil.escapeHTML;
  unescapeHTML: typeof hutil.unescapeHTML;
  encodeURL: typeof hutil.encodeURL;
  decodeURL: typeof hutil.decodeURL;
  escapeRegExp: typeof hutil.escapeRegExp;
  stripHTML: typeof hutil.stripHTML;
  stripIndent: typeof hutil.stripIndent;
  hash: typeof hutil.hash;
  createSha1Hash: typeof hutil.createSha1Hash;
  highlight: typeof hutil.highlight;
  prismHighlight: typeof hutil.prismHighlight;
  tocObj: typeof hutil.tocObj;
  wordWrap: typeof hutil.wordWrap;
  prettyUrls: typeof hutil.prettyUrls;
  isExternalLink: typeof hutil.isExternalLink;
  gravatar: typeof hutil.gravatar;
  htmlTag: typeof hutil.htmlTag;
  truncate: typeof hutil.truncate;
  spawn: typeof hutil.spawn;
  camelCaseKeys: typeof hutil.camelCaseKeys;
  deepMerge: typeof hutil.deepMerge;
}

interface StoreFunction {
  (this: HexoContext, ...args: any[]): any;
}

interface Store {
  [key: string]: StoreFunction;
}

/**
 * A helper makes it easy to quickly add snippets to your templates. We recommend using helpers instead of templates when you’re dealing with more complicated code.
 */
class Helper {
  public store: Store;

  constructor() {
    this.store = {};
  }

  /**
   * @returns {Store} - The plugin store
   */
  list(): Store {
    return this.store;
  }

  /**
   * Get helper plugin function by name
   * @param {String} name - The name of the helper plugin
   * @returns {StoreFunction}
   */
  get(name: string): StoreFunction {
    return this.store[name];
  }

  /**
   * Register a helper plugin
   * @param {String} name - The name of the helper plugin
   * @param {StoreFunction} fn - The helper plugin function
   */
  register(name: string, fn: StoreFunction): void {
    if (!name) throw new TypeError('name is required');
    if (typeof fn !== 'function') throw new TypeError('fn must be a function');

    this.store[name] = fn;
  }
}

export = Helper;
