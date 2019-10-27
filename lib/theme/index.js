'use strict';

const { extname } = require('path');
const { inherits } = require('util');
const Box = require('../box');
const View = require('./view');
const I18n = require('hexo-i18n');

function Theme(ctx) {
  Reflect.apply(Box, this, [ctx, ctx.theme_dir]);

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

  const viewFn = function(path, data) {
    Reflect.apply(View, this, [path, data]);
  };

  const _View = viewFn;
  this.View = viewFn;

  inherits(_View, View);

  _View.prototype._theme = this;
  _View.prototype._render = ctx.render;
  _View.prototype._helper = ctx.extend.helper;
}

inherits(Theme, Box);

Theme.prototype.getView = function(path) {
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
};

Theme.prototype.setView = function(path, data) {
  const ext = extname(path);
  const name = path.substring(0, path.length - ext.length);
  this.views[name] = this.views[name] || {};
  const views = this.views[name] || {};

  views[ext] = new this.View(path, data);
};

Theme.prototype.removeView = function(path) {
  const ext = extname(path);
  const name = path.substring(0, path.length - ext.length);
  const views = this.views[name];

  if (!views) return;

  delete views[ext];
};

module.exports = Theme;
