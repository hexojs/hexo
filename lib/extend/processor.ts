import Promise from 'bluebird';
import { Pattern } from 'hexo-util';

class Processor {
  public store: any;

  constructor() {
    this.store = [];
  }

  list() {
    return this.store;
  }

  register(pattern, fn) {
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
