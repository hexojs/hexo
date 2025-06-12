import { magenta, underline } from 'picocolors';
import table from 'fast-text-table';
import { stringLength } from './common';
import type Hexo from '../../../hexo';
import type { TagSchema } from '../../../types';
import type Model from 'warehouse/dist/model';
import type Document from 'warehouse/dist/document';

function listTag(this: Hexo): void {
  const Tag: Model<TagSchema> = this.model('Tag');

  const data = Tag.sort({name: 1}).map((tag: Document<TagSchema> & TagSchema) => [tag.name, String(tag.length), magenta(tag.path)]);

  // Table header
  const header = ['Name', 'Posts', 'Path'].map(str => underline(str));

  data.unshift(header);

  const t = table(data, {
    align: ['l', 'r', 'l'],
    stringLength
  });

  console.log(t);
  if (data.length === 1) console.log('No tags.');
}

export = listTag;
