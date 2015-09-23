'use strict';

var chalk = require('chalk');
var table = require('text-table');
var common = require('./common');

function listPage() {
  var Page = this.model('Page');

  var data = Page.sort({date: 1}).map(function(page) {
    var date = page.date.format('YYYY-MM-DD');
    return [chalk.gray(date), page.title, chalk.magenta(page.source)];
  });

  // Table header
  var header = ['Date', 'Title', 'Path'].map(function(str) {
    return chalk.underline(str);
  });

  data.unshift(header);

  var t = table(data, {
    stringLength: common.stringLength
  });

  console.log(t);
  if (data.length === 1) console.log('No pages.');
}

module.exports = listPage;
