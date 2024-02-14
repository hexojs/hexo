import type Hexo from '../hexo';

export interface HighlightOptions {
  lang: string | undefined,
  caption: string | undefined,
  lines_length?: number | undefined,

  // plugins/filter/before_post_render/backtick_code_block
  firstLineNumber?: string | number

  // plugins/tag/code.ts
  language_attr?: boolean | undefined;
  firstLine?: number;
  line_number?: boolean | undefined;
  line_threshold?: number | undefined;
  mark?: number[];
  wrap?: boolean | undefined;

}

interface HighlightExecArgs {
  context?: Hexo;
  args?: [string, HighlightOptions];
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

  register(name: string, fn: StoreFunction): void {
    if (typeof fn !== 'function') throw new TypeError('fn must be a function');

    this.store[name] = fn;
  }

  query(name: string): StoreFunction {
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
