import type { LocalsType } from '../../types';

function markdownHelper(this: LocalsType, text: string, options?: any) {
  return this.render(text, 'markdown', options);
}

export = markdownHelper;
