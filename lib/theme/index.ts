import { extname } from 'path';
import Box from '../box';
import View from './view';
import I18n from 'hexo-i18n';
import { config } from './processors/config';
import { i18n } from './processors/i18n';
import { source } from './processors/source';
import { view } from './processors/view';
import type Hexo from '../hexo';

class Theme extends Box {
  public config: any;
  public views: any;
  public i18n: I18n;
  public View: any;
  public processors: any[];

  constructor(ctx: Hexo, options?) {
    super(ctx, ctx.theme_dir, options);

    this.config = {};

    this.views = {};

    this.processors = [
      config,
      i18n,
      source,
      view
    ];

    let languages: string | string[] = ctx.config.language;

    if (!Array.isArray(languages)) languages = [languages];

    languages.push('default');

    this.i18n = new I18n({
      languages: [...new Set(languages.filter(Boolean))]
    });

    class _View extends View {}

    this.View = _View;

    _View.prototype._theme = this;
    _View.prototype._render = ctx.render;
    _View.prototype._helper = ctx.extend.helper;
  }

  getView(path: string) {
    // Replace backslashes on Windows
    path = path.replace(/\\/g, '/');

    const ext = extname(path);
    const name = path.substring(0, path.length - ext.length);
    const views = this.views[name];

    if (!views) return;

    if (ext) {
      return views[ext];
    }

    return views[Object.keys(views)[0]];
  }

  setView(path: string, data) {
    const ext = extname(path);
    const name = path.substring(0, path.length - ext.length);
    this.views[name] = this.views[name] || {};
    const views = this.views[name];

    views[ext] = new this.View(path, data);
  }

  removeView(path: string) {
    const ext = extname(path);
    const name = path.substring(0, path.length - ext.length);
    const views = this.views[name];

    if (!views) return;

    views[ext] = undefined;
  }
}

export = Theme;
