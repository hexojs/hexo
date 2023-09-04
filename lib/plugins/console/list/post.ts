import { gray, magenta, underline } from 'picocolors';
import table from 'text-table';
import { stringLength } from './common';

function mapName(item) {
  return item.name;
}

function listPost(): void {
  const Post = this.model('Post');

  const data = Post.sort({published: -1, date: 1}).map(post => {
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
