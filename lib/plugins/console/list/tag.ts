import * as picocolors from 'picocolors';
import * as fastTextTable from 'fast-text-table';
import { stringLength } from './common.js';
import type Hexo from '../../../hexo/index.js';
import type { TagSchema } from '../../../types.js';
import type Model from 'warehouse/dist/model';
import type Document from 'warehouse/dist/document';

function listTag(this: Hexo): void {
  const Tag: Model<TagSchema> = this.model('Tag');

  const data = Tag.sort({ name: 1 }).map((tag: Document<TagSchema> & TagSchema) => [
    tag.name,
    String(tag.length),
    picocolors.magenta(tag.path)
  ]);

  // Table header
  const header = ['Name', 'Posts', 'Path'].map(str => picocolors.underline(str));

  data.unshift(header);

  // ESM Compatibility
  const table = (fastTextTable.default || fastTextTable) as unknown as typeof fastTextTable.default;
  const t = table(data, {
    align: ['l', 'r', 'l'],
    stringLength
  });

  console.log(t);
  if (data.length === 1) console.log('No tags.');
}

export default listTag;
if (typeof module !== 'undefined' && typeof module.exports === 'object' && module.exports !== null) {
  module.exports = listTag;
  module.exports.default = listTag;
}
