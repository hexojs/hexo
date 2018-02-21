'use strict';

const pathFn = require('path');
const util = require('util');
const Box = require('../box');
const View = require('./view');
const I18n = require('hexo-i18n');
const _ = require('lodash');

function Theme(ctx) {
  Box.call(this, ctx, ctx.theme_dir);

  this.config = {};

  this.views = {};

  this.processors = [
    require('./processors/config'),
    require('./processors/i18n'),
    require('./processors/source'),
    require('./processors/view')
  ];

  let languages = ctx.config.language;

  if (!Array.isArray(languages)) {
    languages = [languages];
  }

  languages.push('default');

  this.i18n = new I18n({
    languages: _(languages).compact().uniq().value()
  });

  const _View = this.View = function(path, data) {
    View.call(this, path, data);
  };

  util.inherits(_View, View);

  _View.prototype._theme = this;
  _View.prototype._render = ctx.render;
  _View.prototype._helper = ctx.extend.helper;
}

util.inherits(Theme, Box);

Theme.prototype.getView = function(path) {
  // Replace backslashes on Windows
  path = path.replace(/\\/g, '/');

  const extname = pathFn.extname(path);
  const name = path.substring(0, path.length - extname.length);
  const views = this.views[name];

  if (!views) return;

  if (extname) {
    return views[extname];
  }

  return views[Object.keys(views)[0]];
};

Theme.prototype.setView = function(path, data) {
  const extname = pathFn.extname(path);
  const name = path.substring(0, path.length - extname.length);
  const views = this.views[name] = this.views[name] || {};

  views[extname] = new this.View(path, data);
};

Theme.prototype.removeView = function(path) {
  const extname = pathFn.extname(path);
  const name = path.substring(0, path.length - extname.length);
  const views = this.views[name];

  if (!views) return;

  delete views[extname];
};

module.exports = Theme;
