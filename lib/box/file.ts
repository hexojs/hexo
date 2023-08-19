import { readFile, readFileSync, stat, statSync, ReadFileOptions } from 'hexo-fs';

class File {
  public source: string;
  public path: string;
  public params: any;
  public type: string;
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

  read(options?: ReadFileOptions) {
    return readFile(this.source, options);
  }

  readSync(options?: ReadFileOptions) {
    return readFileSync(this.source, options);
  }

  stat() {
    return stat(this.source);
  }

  statSync() {
    return statSync(this.source);
  }
}

File.TYPE_CREATE = 'create';
File.TYPE_UPDATE = 'update';
File.TYPE_SKIP = 'skip';
File.TYPE_DELETE = 'delete';

export = File;
