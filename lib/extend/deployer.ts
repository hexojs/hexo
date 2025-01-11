import Promise from 'bluebird';
import type { NodeJSLikeCallback } from '../types';
import type Hexo from '../hexo';

interface StoreFunction {
  (this: Hexo, deployArg: { type: string; [key: string]: any }): Promise<any>;
}
interface Store {
  [key: string]: StoreFunction;
}

/**
 * A deployer helps users quickly deploy their site to a remote server without complicated commands.
 */
class Deployer {
  public store: Store;

  constructor() {
    this.store = {};
  }

  list(): Store {
    return this.store;
  }

  get(name: string): StoreFunction {
    return this.store[name];
  }

  register(
    name: string,
    fn: (
      this: Hexo,
      deployArg: {
        type: string;
        [key: string]: any;
      },
      callback?: NodeJSLikeCallback<any>
    ) => any
  ): void {
    if (!name) throw new TypeError('name is required');
    if (typeof fn !== 'function') throw new TypeError('fn must be a function');

    if (fn.length > 1) {
      fn = Promise.promisify(fn);
    } else {
      fn = Promise.method(fn);
    }

    this.store[name] = fn;
  }
}

export = Deployer;
