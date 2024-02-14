import { magenta, underline, gray } from 'picocolors';
import table from 'text-table';
import { stringLength } from './common';
import type Hexo from '../../../hexo';

function listPage(this: Hexo): void {
  const Page = this.model('Page');

  const data = Page.sort({date: 1}).map(page => {
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

export = listPage;
