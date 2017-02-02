'use strict';

var chalk = require('chalk');
var table = require('text-table');
var common = require('./common');

function mapName(item) {
  return item.name;
}

function listPost() {
  var Post = this.model('Post');

  var data = Post.sort({published: -1, date: 1}).map(function(post) {
    var date = post.published ? post.date.format('YYYY-MM-DD') : 'Draft';
    var tags = post.tags.map(mapName);
    var categories = post.categories.map(mapName);

    return [
      chalk.gray(date),
      post.title,
      chalk.magenta(post.source),
      categories.join(', '),
      tags.join(', ')
    ];
  });

  // Table header
  var header = ['Date', 'Title', 'Path', 'Category', 'Tags'].map(function(str) {
    return chalk.underline(str);
  });

  data.unshift(header);

  var t = table(data, {
    stringLength: common.stringLength
  });

  console.log(t);
  if (data.length === 1) console.log('No posts.');
}

module.exports = listPost;
