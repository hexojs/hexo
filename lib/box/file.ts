import type Promise from 'bluebird';
import { readFile, readFileSync, stat, statSync, type ReadFileOptions } from 'hexo-fs';
import type fs from 'fs';

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

  read(options?: ReadFileOptions): Promise<string> {
    return readFile(this.source, options) as Promise<string>;
  }

  readSync(options?: ReadFileOptions): string {
    return readFileSync(this.source, options) as string;
  }

  stat(): Promise<fs.Stats> {
    return stat(this.source);
  }

  statSync(): fs.Stats {
    return statSync(this.source);
  }
}

File.TYPE_CREATE = 'create';
File.TYPE_UPDATE = 'update';
File.TYPE_SKIP = 'skip';
File.TYPE_DELETE = 'delete';

export = File;
