import Promise from 'bluebird';
import { Pattern } from 'hexo-util';

interface StoreFunction {
  (args: any): any
}

type Store = {
    pattern: Pattern;
    process: StoreFunction
  }[];

type patternType = Exclude<ConstructorParameters<typeof Pattern>[0], ((str: string) => string)>;
class Processor {
  public store: Store;

  constructor() {
    this.store = [];
  }

  list() {
    return this.store;
  }

  register(fn: StoreFunction): void;
  register(pattern: patternType, fn: StoreFunction): void;
  register(pattern: patternType | StoreFunction, fn?: StoreFunction) {
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
      pattern: new Pattern(pattern),
      process: fn
    });
  }
}

export = Processor;
