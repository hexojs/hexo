import type Hexo from '../hexo';

export interface HighlightOptions {
  // plulgins/filter/before_post_render/backtick_code_block
  lang: string,
  caption: string,
  lines_length?: number,
  firstLineNumber?: string | number


  language_attr?: boolean;
  firstLine?: number;
  line_number?: boolean;
  line_threshold?: number;
  mark?: number[];
  wrap?: boolean;

}

interface HighlightExecArgs {
  context?: Hexo;
  args?: [
    content: string,
    options: HighlightOptions,
  ];
}

interface StoreFunction {
  (content: string, options: HighlightOptions): string;
  priority?: number;
}

interface Store {
  [key: string]: StoreFunction
}

class SyntaxHighlight {
  public store: Store;

  constructor() {
    this.store = {};
  }

  register(name: string, fn: StoreFunction) {
    if (typeof fn !== 'function') throw new TypeError('fn must be a function');

    this.store[name] = fn;
  }

  query(name: string) {
    return name && this.store[name];
  }

  exec(name: string, options: HighlightExecArgs): string {
    const fn = this.store[name];

    if (!fn) throw new TypeError(`syntax highlighter ${name} is not registered`);
    const ctx = options.context;
    const args = options.args || [];

    return Reflect.apply(fn, ctx, args);
  }
}

export default SyntaxHighlight;
