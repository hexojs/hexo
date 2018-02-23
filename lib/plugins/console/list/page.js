'use strict';

const chalk = require('chalk');
const table = require('text-table');
const common = require('./common');

function listPage() {
  const Page = this.model('Page');

  const data = Page.sort({date: 1}).map(page => {
    const date = page.date.format('YYYY-MM-DD');
    return [chalk.gray(date), page.title, chalk.magenta(page.source)];
  });

  // Table header
  const header = ['Date', 'Title', 'Path'].map(str => chalk.underline(str));

  data.unshift(header);

  const t = table(data, {
    stringLength: common.stringLength
  });

  console.log(t);
  if (data.length === 1) console.log('No pages.');
}

module.exports = listPage;
