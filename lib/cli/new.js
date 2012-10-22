var moment = require('moment'),
  clc = require('cli-color'),
  fs = require('fs'),
  extend = require('../extend'),
  util = require('../util'),
  file = util.file;

extend.console.register('new_post', 'Create a new post', function(args){
  var slug = args[0];

  if (slug === undefined){
    console.log('Usage: hexo new_post <title>');
    return false;
  }

  var date = moment().format('YYYY-MM-DD HH:mm:ss'),
    target = hexo.source_dir + '_posts/' + slug + '.md';

  var content = [
    '---',
    'layout: post',
    'title: ' + slug,
    'date: ' + date,
    'comments: true',
    'tags:',
    '---'
  ];

  fs.exists(target, function(exist){
    if (exist){
      console.log('%s already exists. Use other filename instead.', clc.bold(target));
    } else {
      file.write(target, content.join('\n') + '\n', function(err){
        if (err) throw err;
        console.log('Post created in %s', clc.bold(target));
      });
    }
  });
});

extend.console.register('new_page', 'Create a new page', function(args){
  var slug = args[0];

  if (slug === undefined){
    console.log('Usage: hexo new_page <title>');
    return false;
  }

  var date = moment().format('YYYY-MM-DD HH:mm:ss'),
    target = hexo.source_dir + slug + '/index.md';

  var content = [
    '---',
    'layout: page',
    'title: ' + slug,
    'date: ' + date,
    'comments: true',
    '---'
  ];

  fs.exists(target, function(exist){
    if (exist){
      console.log('%s already exists. Use other filename instead.', clc.bold(target));
    } else {
      file.write(target, content.join('\n') + '\n', function(err){
        if (err) throw err;
        console.log('Page created in %s', clc.bold(target));
      });
    }
  });
});