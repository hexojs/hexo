import Promise from 'bluebird';
import abbrev from 'abbrev';

type Option = Partial<{
  usage: string;
  desc: string;
  init: boolean;
  arguments: {
      name: string;
      desc: string;
    }[];
  options: {
    name: string;
    desc: string;
  }[];
}>

interface Args {
  _: string[];
  [key: string]: string | boolean | string[];
}
type AnyFn = (args: Args) => any;
interface StoreFunction extends AnyFn {
  desc?: string;
  options?: Option;
}

interface Store {
  [key: string]: StoreFunction
}
interface Alias {
  [key: string]: string
}

class Console {
  public store: Store;
  public alias: Alias;

  constructor() {
    this.store = {};
    this.alias = {};
  }

  /**
   * Get a console plugin function by name
   * @param {String} name - The name of the console plugin
   * @returns {StoreFunction} - The console plugin function
   */
  get(name: string): StoreFunction {
    name = name.toLowerCase();
    return this.store[this.alias[name]];
  }

  list(): Store {
    return this.store;
  }

  /**
   * Register a console plugin
   * @param {String} name - The name of console plugin to be registered
   * @param {String} desc - More detailed information about a console command
   * @param {Option} options - The description of each option of a console command
   * @param {AnyFn} fn - The console plugin to be registered
   */
  register(name: string, fn: AnyFn): void
  register(name: string, desc: string, fn: AnyFn): void
  register(name: string, options: Option, fn: AnyFn): void
  register(name: string, desc: string, options: Option, fn: AnyFn): void
  register(name: string, desc: string | Option | AnyFn, options?: Option | AnyFn, fn?: AnyFn): void {
    if (!name) throw new TypeError('name is required');

    if (!fn) {
      if (options) {
        if (typeof options === 'function') {
          fn = options;

          if (typeof desc === 'object') { // name, options, fn
            options = desc;
            desc = '';
          } else { // name, desc, fn
            options = {};
          }
        } else {
          throw new TypeError('fn must be a function');
        }
      } else {
        // name, fn
        if (typeof desc === 'function') {
          fn = desc;
          options = {};
          desc = '';
        } else {
          throw new TypeError('fn must be a function');
        }
      }
    }

    if (fn.length > 1) {
      fn = Promise.promisify(fn);
    } else {
      fn = Promise.method(fn);
    }

    const c = fn as StoreFunction;
    this.store[name.toLowerCase()] = c;
    c.options = options as Option;
    c.desc = desc as string;

    this.alias = abbrev(Object.keys(this.store));
  }
}

export = Console;
