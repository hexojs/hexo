'use strict';

var pathFn = require('path');
var fs = require('hexo-fs');

function Scaffold(context) {
  this.context = context;
  this.scaffoldDir = context.scaffold_dir;
}

Scaffold.prototype.defaults = {
  normal: [
    'layout: {{ layout }}',
    'title: {{ title }}',
    'date: {{ date }}',
    'tags:',
    '---'
  ].join('\n')
};

Scaffold.prototype._listDir = function() {
  var scaffoldDir = this.scaffoldDir;

  return fs.exists(scaffoldDir).then(function(exist) {
    if (!exist) return [];

    return fs.listDir(scaffoldDir, {
      ignoreFilesRegex: /^_|\/_/
    });
  }).map(function(item) {
    return {
      name: item.substring(0, item.length - pathFn.extname(item).length),
      path: pathFn.join(scaffoldDir, item)
    };
  });
};

Scaffold.prototype._getScaffold = function(name) {
  return this._listDir().then(function(list) {
    var item;

    for (var i = 0, len = list.length; i < len; i++) {
      item = list[i];
      if (item.name === name) return item;
    }
  });
};

Scaffold.prototype.get = function(name, callback) {
  var self = this;

  return this._getScaffold(name).then(function(item) {
    if (item) {
      return fs.readFile(item.path);
    }

    return self.defaults[name];
  }).asCallback(callback);
};

Scaffold.prototype.set = function(name, content, callback) {
  var scaffoldDir = this.scaffoldDir;

  return this._getScaffold(name).then(function(item) {
    var path = item ? item.path : pathFn.join(scaffoldDir, name);
    if (!pathFn.extname(path)) path += '.md';

    return fs.writeFile(path, content);
  }).asCallback(callback);
};

Scaffold.prototype.remove = function(name, callback) {
  return this._getScaffold(name).then(function(item) {
    if (!item) return;

    return fs.unlink(item.path);
  }).asCallback(callback);
};

module.exports = Scaffold;
