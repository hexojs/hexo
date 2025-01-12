import Promise from 'bluebird';
import type { BaseGeneratorReturn, NodeJSLikeCallback, SiteLocals } from '../types';

type ReturnType = BaseGeneratorReturn | BaseGeneratorReturn[];
type GeneratorReturnType = ReturnType | Promise<ReturnType>;

interface GeneratorFunction {
  (locals: SiteLocals, callback?: NodeJSLikeCallback<any>): GeneratorReturnType;
}

type StoreFunctionReturn = Promise<ReturnType>;

interface StoreFunction {
  (locals: SiteLocals): StoreFunctionReturn;
}

interface Store {
  [key: string]: StoreFunction
}

/**
 * A generator builds routes based on processed files.
 */
class Generator {
  public id: number;
  public store: Store;

  constructor() {
    this.id = 0;
    this.store = {};
  }

  list(): Store {
    return this.store;
  }

  get(name: string): StoreFunction {
    return this.store[name];
  }

  register(fn: GeneratorFunction): void
  register(name: string, fn: GeneratorFunction): void
  register(name: string | GeneratorFunction, fn?: GeneratorFunction): void {
    if (!fn) {
      if (typeof name === 'function') { // fn
        fn = name;
        name = `generator-${this.id++}`;
      } else {
        throw new TypeError('fn must be a function');
      }
    }

    if (fn.length > 1) fn = Promise.promisify(fn);
    this.store[name as string] = Promise.method(fn);
  }
}

export = Generator;
