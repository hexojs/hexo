'use strict';

const { underline } = require('picocolors');
const table = require('text-table');
const { stringLength } = require('./common');

function listCategory() {
  const categories = this.model('Category');

  const data = categories.sort({name: 1}).map(cate => [cate.name, String(cate.length)]);

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

module.exports = listCategory;
