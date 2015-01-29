'use strict';

var chalk = require('chalk');
var table = require('text-table');
var common = require('./common');

function listTag(){
  /* jshint validthis: true */
  var Tag = this.model('Tag');

  var data = Tag.sort({name: 1}).map(function(tag){
    return [tag.name, String(tag.length), chalk.magenta(tag.path)];
  });

  // Table header
  var header = ['Name', 'Posts', 'Path'].map(function(str){
    return chalk.underline(str);
  });

  data.unshift(header);

  var t = table(data, {
    align: ['l', 'r', 'l'],
    stringLength: common.stringLength
  });

  console.log(t);
  if (data.length === 1) console.log('No tags.');
}

module.exports = listTag;