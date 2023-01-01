import Promise from 'bluebird';

class Generator {
  public id: any;
  public store: any;

  constructor() {
    this.id = 0;
    this.store = {};
  }

  list() {
    return this.store;
  }

  get(name: string) {
    return this.store[name];
  }

  register(name, fn) {
    if (!fn) {
      if (typeof name === 'function') {
        fn = name;
        name = `generator-${this.id++}`;
      } else {
        throw new TypeError('fn must be a function');
      }
    }

    if (fn.length > 1) fn = Promise.promisify(fn);
    this.store[name] = Promise.method(fn);
  }
}

export = Generator;
