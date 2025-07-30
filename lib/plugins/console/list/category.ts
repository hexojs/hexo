import * as picocolors from 'picocolors';
import { stringLength } from './common.js';
import type Hexo from '../../../hexo/index.js';
import type { CategorySchema } from '../../../types.js';
import type Model from 'warehouse/dist/model';
import type Document from 'warehouse/dist/document';
import * as fastTextTable from 'fast-text-table';

function listCategory(this: Hexo): void {
  const categories: Model<CategorySchema> = this.model('Category');

  const data = categories.sort({name: 1}).map((cate: Document<CategorySchema> & CategorySchema) => [cate.name, String(cate.length)]);

  // Table header
  const header = ['Name', 'Posts'].map(str => picocolors.underline(str));

  data.unshift(header);

  // ESM Compatibility
  const table = ((fastTextTable.default || fastTextTable) as unknown as typeof fastTextTable.default);
  const t = table(data, {
    align: ['l', 'r'],
    stringLength
  });

  console.log(t);
  if (data.length === 1) console.log('No categories.');
}

export default listCategory;
if (typeof module !== 'undefined' && typeof module.exports === 'object' && module.exports !== null) {
  module.exports = listCategory;
  module.exports.default = listCategory;
}
