import Hexo from '../hexo';
import { PageSchema } from '../types';

interface HexoContext extends Hexo {
  // https://github.com/dimaslanjaka/hexo-renderers/blob/147340f6d03a8d3103e9589ddf86778ed7f9019b/src/helper/related-posts.ts#L106-L113
  page?: PageSchema;
}

interface StoreFunction {
  (this: HexoContext, ...args: any[]): string;
}

interface Store {
  [key: string]: StoreFunction;
}

class Helper {
  public store: Store;

  constructor() {
    this.store = {};
  }

  /**
   * @returns {Store} - The plugin store
   */
  list(): Store {
    return this.store;
  }

  /**
   * Get helper plugin function by name
   * @param {String} name - The name of the helper plugin
   * @returns {StoreFunction}
   */
  get(name: string): StoreFunction {
    return this.store[name];
  }

  /**
   * Register a helper plugin
   * @param {String} name - The name of the helper plugin
   * @param {StoreFunction} fn - The helper plugin function
   */
  register(name: string, fn: StoreFunction): void {
    if (!name) throw new TypeError('name is required');
    if (typeof fn !== 'function') throw new TypeError('fn must be a function');

    this.store[name] = fn;
  }
}

export = Helper;
