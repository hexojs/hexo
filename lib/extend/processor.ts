import Promise from 'bluebird';
import { Pattern } from 'hexo-util';
import type File from '../box/file.js';

interface StoreFunction {
  (file: File | string): any;
}

type Store = {
  pattern: Pattern;
  process: StoreFunction;
}[];

type patternType = Exclude<ConstructorParameters<typeof Pattern>[0], (str: string) => string>;

/**
 * A processor is used to process source files in the `source` folder.
 */
class Processor {
  public store: Store;

  constructor() {
    this.store = [];
  }

  list(): Store {
    return this.store;
  }

  register(fn: StoreFunction): void;
  register(pattern: patternType, fn: StoreFunction): void;
  register(pattern: patternType | StoreFunction, fn?: StoreFunction): void {
    if (!fn) {
      if (typeof pattern === 'function') {
        fn = pattern;
        pattern = /(.*)/;
      } else {
        throw new TypeError('fn must be a function');
      }
    }

    if (fn.length > 1) {
      fn = Promise.promisify(fn);
    } else {
      fn = Promise.method(fn);
    }

    this.store.push({
      pattern: new Pattern(pattern as patternType),
      process: fn
    });
  }
}

export default Processor;
if (typeof module !== 'undefined' && typeof module.exports === 'object' && module.exports !== null) {
  module.exports = Processor;
  module.exports.default = Processor;
}
