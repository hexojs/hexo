import { magenta, underline } from 'picocolors';
import table from 'text-table';
import { stringLength } from './common';

function listTag(): void {
  const Tag = this.model('Tag');

  const data = Tag.sort({name: 1}).map(tag => [tag.name, String(tag.length), magenta(tag.path)]);

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
