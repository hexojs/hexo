import type Promise from 'bluebird';
import { readFile, readFileSync, stat, statSync, type ReadFileOptions } from 'hexo-fs';
import type fs from 'fs';

class File {

  /**
   * Full path of the file
   */
  public source: string;

  /**
   * Relative path to the box of the file
   */
  public path: string;

  /**
   * The information from path matching.
   */
  public params: any;

  /**
   * File type. The value can be create, update, skip, delete.
   */
  // eslint-disable-next-line no-use-before-define
  public type: typeof File.TYPE_CREATE | typeof File.TYPE_UPDATE | typeof File.TYPE_SKIP | typeof File.TYPE_DELETE;
  static TYPE_CREATE: 'create';
  static TYPE_UPDATE: 'update';
  static TYPE_SKIP: 'skip';
  static TYPE_DELETE: 'delete';

  constructor({ source, path, params, type }: {
    source: string;
    path: string;
    params: any;
    type: typeof File.TYPE_CREATE | typeof File.TYPE_UPDATE | typeof File.TYPE_SKIP | typeof File.TYPE_DELETE;
  }) {
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
