'use strict';

const { extname, join } = require('path');
const fs = require('hexo-fs');

function Scaffold(context) {
  this.context = context;
  this.scaffoldDir = context.scaffold_dir;
}

Scaffold.prototype.defaults = {
  normal: [
    '---',
    'layout: {{ layout }}',
    'title: {{ title }}',
    'date: {{ date }}',
    'tags:',
    '---'
  ].join('\n')
};

Scaffold.prototype._listDir = function() {
  const { scaffoldDir } = this;

  return fs.exists(scaffoldDir).then(exist => {
    if (!exist) return [];

    return fs.listDir(scaffoldDir, {
      ignoreFilesRegex: /^_|\/_/
    });
  }).map(item => ({
    name: item.substring(0, item.length - extname(item).length),
    path: join(scaffoldDir, item)
  }));
};

Scaffold.prototype._getScaffold = function(name) {
  return this._listDir().then(list => {
    let item;

    for (let i = 0, len = list.length; i < len; i++) {
      item = list[i];
      if (item.name === name) return item;
    }
  });
};

Scaffold.prototype.get = function(name, callback) {
  const self = this;

  return this._getScaffold(name).then(item => {
    if (item) {
      return fs.readFile(item.path);
    }

    return self.defaults[name];
  }).asCallback(callback);
};

Scaffold.prototype.set = function(name, content, callback) {
  const { scaffoldDir } = this;

  return this._getScaffold(name).then(item => {
    let path = item ? item.path : join(scaffoldDir, name);
    if (!extname(path)) path += '.md';

    return fs.writeFile(path, content);
  }).asCallback(callback);
};

Scaffold.prototype.remove = function(name, callback) {
  return this._getScaffold(name).then(item => {
    if (!item) return;

    return fs.unlink(item.path);
  }).asCallback(callback);
};

module.exports = Scaffold;
