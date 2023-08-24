import { extname, join } from 'path';
import { exists, listDir, readFile, unlink, writeFile } from 'hexo-fs';
import type Hexo from './index';
class Scaffold {
  public context: Hexo;
  public scaffoldDir: string;
  public defaults: any;

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

  _listDir() {
    const { scaffoldDir } = this;

    return exists(scaffoldDir).then(exist => {
      if (!exist) return [];

      return listDir(scaffoldDir, {
        ignorePattern: /^_|\/_/
      });
    }).map(item => ({
      name: item.substring(0, item.length - extname(item).length),
      path: join(scaffoldDir, item)
    }));
  }

  _getScaffold(name: string) {
    return this._listDir().then(list => list.find(item => item.name === name));
  }

  get(name: string, callback?: (...args: any[]) => void) {
    return this._getScaffold(name).then(item => {
      if (item) {
        return readFile(item.path);
      }

      return this.defaults[name];
    }).asCallback(callback);
  }

  set(name: string, content: any, callback: (...args: any[]) => void) {
    const { scaffoldDir } = this;

    return this._getScaffold(name).then(item => {
      let path = item ? item.path : join(scaffoldDir, name);
      if (!extname(path)) path += '.md';

      return writeFile(path, content);
    }).asCallback(callback);
  }

  remove(name: string, callback: (...args: any[]) => void) {
    return this._getScaffold(name).then(item => {
      if (!item) return;

      return unlink(item.path);
    }).asCallback(callback);
  }
}

export = Scaffold;
