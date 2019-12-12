'use strict';

const { extname, join } = require('path');
const fs = require('hexo-fs');

class Scaffold {
  constructor(context) {
    this.context = context;
    this.scaffoldDir = context.scaffold_dir;
  }

  _listDir() {
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
  }

  _getScaffold(name) {
    return this._listDir().then(list => list.find(item => item.name === name));
  }

  get(name, callback) {
    return this._getScaffold(name).then(item => {
      if (item) {
        return fs.readFile(item.path);
      }

      return this.defaults[name];
    }).asCallback(callback);
  }

  set(name, content, callback) {
    const { scaffoldDir } = this;

    return this._getScaffold(name).then(item => {
      let path = item ? item.path : join(scaffoldDir, name);
      if (!extname(path)) path += '.md';

      return fs.writeFile(path, content);
    }).asCallback(callback);
  }

  remove(name, callback) {
    return this._getScaffold(name).then(item => {
      if (!item) return;

      return fs.unlink(item.path);
    }).asCallback(callback);
  }
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

module.exports = Scaffold;
