'use strict';

const { extname } = require('path');
const Box = require('../box');
const View = require('./view');
const I18n = require('hexo-i18n');

class Theme extends Box {
  constructor(ctx, options) {
    super(ctx, ctx.theme_dir, options);

    this.config = {};

    this.views = {};

    this.processors = [
      require('./processors/config'),
      require('./processors/i18n'),
      require('./processors/source'),
      require('./processors/view')
    ];

    let languages = ctx.config.language;

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

  getView(path) {
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

  setView(path, data) {
    const ext = extname(path);
    const name = path.substring(0, path.length - ext.length);
    this.views[name] = this.views[name] || {};
    const views = this.views[name];

    views[ext] = new this.View(path, data);
  }

  removeView(path) {
    const ext = extname(path);
    const name = path.substring(0, path.length - ext.length);
    const views = this.views[name];

    if (!views) return;

    views[ext] = undefined;
  }
}

module.exports = Theme;
