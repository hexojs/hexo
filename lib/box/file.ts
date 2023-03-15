import { readFile, readFileSync, stat, statSync } from 'hexo-fs';

class File {
  public source: any;
  public path: any;
  public params: any;
  public type: any;
  static TYPE_CREATE: 'create';
  static TYPE_UPDATE: 'update';
  static TYPE_SKIP: 'skip';
  static TYPE_DELETE: 'delete';

  constructor({ source, path, params, type }) {
    this.source = source;
    this.path = path;
    this.params = params;
    this.type = type;
  }

  read(options) {
    return readFile(this.source, options);
  }

  readSync(options) {
    return readFileSync(this.source, options);
  }

  stat(options) {
    return stat(this.source);
  }

  statSync(options) {
    return statSync(this.source);
  }
}

File.TYPE_CREATE = 'create';
File.TYPE_UPDATE = 'update';
File.TYPE_SKIP = 'skip';
File.TYPE_DELETE = 'delete';

export = File;
