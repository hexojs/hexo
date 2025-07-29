import * as picocolors from 'picocolors';
import table from 'fast-text-table';
import { stringLength } from './common.js';
import type Hexo from '../../../hexo/index.js';
import type { PostSchema } from '../../../types.js';
import type Model from 'warehouse/dist/model';
import type Document from 'warehouse/dist/document';

function mapName(item: any): string {
  return item.name;
}

function listPost(this: Hexo): void {
  const Post: Model<PostSchema> = this.model('Post');

  const data = Post.sort({published: -1, date: 1}).map((post: Document<PostSchema> & PostSchema) => {
    const date = post.published ? post.date.format('YYYY-MM-DD') : 'Draft';
    const tags = post.tags.map(mapName);
    const categories = post.categories.map(mapName);

    return [
      picocolors.gray(date),
      post.title,
      picocolors.magenta(post.source),
      categories.join(', '),
      tags.join(', ')
    ];
  });

  // Table header
  const header = ['Date', 'Title', 'Path', 'Category', 'Tags'].map(str => picocolors.underline(str));

  data.unshift(header);

  const t = table(data, {
    stringLength
  });

  console.log(t);
  if (data.length === 1) console.log('No posts.');
}

export default listPost;
if (typeof module !== 'undefined' && typeof module.exports === 'object' && module.exports !== null) {
  module.exports = listPost;
  module.exports.default = listPost;
}
