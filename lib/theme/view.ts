import { extname, join } from 'path';
import { parse as yfm } from 'hexo-front-matter';
import Promise from 'bluebird';
import type Theme from '.';
import type Render from '../hexo/render';
import type { NodeJSLikeCallback } from '../types';
import type { Helper } from '../extend';

const assignIn = (target: any, ...sources: any[]) => {
  const length = sources.length;

  if (length < 1 || target == null) return target;
  for (let i = 0; i < length; i++) {
    const source = sources[i];

    for (const key in source) {
      target[key] = source[key];
    }
  }
  return target;
};

class Options {
  layout?: any;
  [key: string]: any;
}

class View {
  public path: string;
  public source: string;
  public _theme: Theme;
  public data: any;
  public _compiled: (locals: any) => Promise<any>;
  public _compiledSync: (locals: any) => any;
  public _helper: Helper;
  public _render: Render;
  public _disableManagedLayout: boolean;

  constructor(path: string, data: string) {
    this.path = path;
    this.source = join(this._theme.base, 'layout', path);
    this.data = typeof data === 'string' ? yfm(data) : data;

    this._precompile();
  }

  render(callback: NodeJSLikeCallback<any>): Promise<any>;
  render(options: Options, callback?: NodeJSLikeCallback<any>): Promise<any>;
  render(options: Options | NodeJSLikeCallback<any> = {}, callback?: NodeJSLikeCallback<any>): Promise<any> {
    if (!callback && typeof options === 'function') {
      callback = options;
      options = {};
    }
    const { data } = this;
    const { layout = (options as Options).layout } = data;
    const locals = this._buildLocals(options as Options);

    if (this._disableManagedLayout) {
      // Let the renderer compose the layout chain itself
      locals.layout = layout || false;
    }

    return this._compiled(this._bindHelpers(locals)).then(result => {
      if (this._disableManagedLayout || result == null || !layout) return result;

      const layoutView = this._resolveLayout(layout);
      if (!layoutView) return result;

      const layoutLocals = {
        ...locals,
        body: result,
        layout: false
      };

      return layoutView.render(layoutLocals, callback);
    }).asCallback(callback);
  }

  renderSync(options: Options = {}) {
    const { data } = this;
    const { layout = options.layout } = data;
    const locals = this._buildLocals(options);

    if (this._disableManagedLayout) {
      // Let the renderer compose the layout chain itself
      locals.layout = layout || false;
    }

    const result = this._compiledSync(this._bindHelpers(locals));

    if (this._disableManagedLayout || result == null || !layout) return result;

    const layoutView = this._resolveLayout(layout);
    if (!layoutView) return result;

    const layoutLocals = {
      ...locals,
      body: result,
      layout: false
    };

    return layoutView.renderSync(layoutLocals);
  }

  _buildLocals(locals: Options) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { layout, _content, ...data } = this.data;
    return assignIn({}, locals, data, {
      filename: this.source
    });
  }

  _bindHelpers(locals) {
    const helpers = this._helper.list();
    const keys = Object.keys(helpers);

    for (const key of keys) {
      locals[key] = helpers[key].bind(locals);
    }

    return locals;
  }

  _resolveLayout(name: string): View {
    return this._theme.resolveLayout(this.path, name);
  }

  _precompile(): void {
    const render = this._render;
    const ctx = render.context;
    const ext = extname(this.path);
    const renderer = render.getRenderer(ext);
    this._disableManagedLayout = !!renderer?.disableManagedLayout;
    const data = {
      path: this.source,
      viewPath: this.path,
      text: this.data._content
    };

    function buildFilterArguments(result: any): [string, any, { context: any, args: any[] }] {
      const output = render.getOutput(ext) || ext;
      return [
        `after_render:${output}`,
        result,
        {
          context: ctx,
          args: [data]
        }
      ];
    }

    if (renderer && typeof renderer.compile === 'function') {
      const compiled = renderer.compile(data);

      this._compiledSync = locals => {
        const result = compiled(locals);
        return ctx.execFilterSync(...buildFilterArguments(result));
      };

      this._compiled = locals => Promise.resolve(compiled(locals))
        .then(result => ctx.execFilter(...buildFilterArguments(result)));
    } else {
      this._compiledSync = locals => render.renderSync(data, locals);

      this._compiled = locals => render.render(data, locals);
    }
  }
}

export = View;
