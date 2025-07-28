import { magenta, underline, gray } from 'picocolors';
import table from 'fast-text-table';
import { stringLength } from './common.js';
import type Hexo from '../../../hexo/index.js';
import type { PageSchema } from '../../../types.js';
import type Model from 'warehouse/dist/model';
import type Document from 'warehouse/dist/document';

function listPage(this: Hexo): void {
  const Page: Model<PageSchema> = this.model('Page');

  const data = Page.sort({date: 1}).map((page: Document<PageSchema> & PageSchema) => {
    const date = page.date.format('YYYY-MM-DD');
    return [gray(date), page.title, magenta(page.source)];
  });

  // Table header
  const header = ['Date', 'Title', 'Path'].map(str => underline(str));

  data.unshift(header);

  const t = table(data, {
    stringLength
  });

  console.log(t);
  if (data.length === 1) console.log('No pages.');
}

export default listPage;
if (typeof module !== 'undefined' && typeof module.exports === 'object' && module.exports !== null) {
  module.exports = listPage;
  module.exports.default = listPage;
}
