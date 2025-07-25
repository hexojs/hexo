import { underline } from 'picocolors';
import table from 'fast-text-table';
import { stringLength } from './common';
import type Hexo from '../../../hexo';
import type { CategorySchema } from '../../../types';
import type Model from 'warehouse/dist/model';
import type Document from 'warehouse/dist/document';

function listCategory(this: Hexo): void {
  const categories: Model<CategorySchema> = this.model('Category');

  const data = categories.sort({name: 1}).map((cate: Document<CategorySchema> & CategorySchema) => [cate.name, String(cate.length)]);

  // Table header
  const header = ['Name', 'Posts'].map(str => underline(str));

  data.unshift(header);

  const t = table(data, {
    align: ['l', 'r'],
    stringLength
  });

  console.log(t);
  if (data.length === 1) console.log('No categories.');
}

export = listCategory;
