'use strict';

const chalk = require('chalk');
const table = require('text-table');
const common = require('./common');

function listTag() {
  const Tag = this.model('Tag');

  const data = Tag.sort({name: 1}).map(tag => [tag.name, String(tag.length), chalk.magenta(tag.path)]);

  // Table header
  const header = ['Name', 'Posts', 'Path'].map(str => chalk.underline(str));

  data.unshift(header);

  const t = table(data, {
    align: ['l', 'r', 'l'],
    stringLength: common.stringLength
  });

  console.log(t);
  if (data.length === 1) console.log('No tags.');
}

module.exports = listTag;
