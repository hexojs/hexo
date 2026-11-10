import { extname, join } from 'path';
import { exists, listDir, readFile, unlink, writeFile } from 'hexo-fs';
import type Hexo from './index';
import type { NodeJSLikeCallback } from '../types';
import { asCallback } from '../util/promise';

class Scaffold {
  public context: Hexo;
  public scaffoldDir: string;
  public defaults: {
    normal: string
  };

  constructor(context: Hexo) {
    this.context = context;
    this.scaffoldDir = context.scaffold_dir;
    this.defaults = {
      normal: [
        '---',
        'layout: {{ layout }}',
        'title: {{ title }}',
        'date: {{ date }}',
        'tags:',
        '---'
      ].join('\n')
    };
  }

  _listDir(): Promise<{
    name: string;
    path: string;
  }[]> {
    const { scaffoldDir } = this;

    return Promise.resolve(exists(scaffoldDir)).then(exist => {
      if (!exist) return [];

      return listDir(scaffoldDir, {
        ignorePattern: /^_|\/_/
      });
    }).then(items => items.map(item => ({
      name: item.substring(0, item.length - extname(item).length),
      path: join(scaffoldDir, item)
    })));
  }

  _getScaffold(name: string): Promise<{
    name: string;
    path: string;
  }> {
    return this._listDir().then(list => list.find(item => item.name === name));
  }

  get(name: string, callback?: NodeJSLikeCallback<any>): Promise<string> {
    return asCallback(this._getScaffold(name).then(item => {
      if (item) {
        return readFile(item.path);
      }

      return this.defaults[name];
    }), callback);
  }

  set(name: string, content: any, callback?: NodeJSLikeCallback<void>): Promise<void> {
    const { scaffoldDir } = this;

    return asCallback(this._getScaffold(name).then(item => {
      let path = item ? item.path : join(scaffoldDir, name);
      if (!extname(path)) path += '.md';

      return writeFile(path, content);
    }), callback);
  }

  remove(name: string, callback?: NodeJSLikeCallback<void>): Promise<void> {
    return asCallback(this._getScaffold(name).then(item => {
      if (!item) return;

      return unlink(item.path);
    }), callback);
  }
}

export = Scaffold;
