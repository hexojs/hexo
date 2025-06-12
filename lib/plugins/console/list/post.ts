import { gray, magenta, underline } from 'picocolors';
import table from 'fast-text-table';
import { stringLength } from './common';
import type Hexo from '../../../hexo';
import type { PostSchema } from '../../../types';
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
      gray(date),
      post.title,
      magenta(post.source),
      categories.join(', '),
      tags.join(', ')
    ];
  });

  // Table header
  const header = ['Date', 'Title', 'Path', 'Category', 'Tags'].map(str => underline(str));

  data.unshift(header);

  const t = table(data, {
    stringLength
  });

  console.log(t);
  if (data.length === 1) console.log('No posts.');
}

export = listPost;
