import Promise from 'bluebird';
import { Pattern } from 'hexo-util';
import type File from '../box/file';

interface StoreFunction {
  (file: File): any
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
    if (typeof fn !== 'function') {
      if (typeof pattern === 'function') {
        fn = pattern as StoreFunction;
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

export = Processor;
