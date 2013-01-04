var moment = require('moment'),
  clc = require('cli-color'),
  fs = require('graceful-fs'),
  path = require('path'),
  sep = path.sep,
  extend = require('../extend'),
  util = require('../util'),
  file = util.file;

extend.console.register('new_post', 'Create a new post', function(args){
  if (!args.length){
    console.log('Usage: hexo new_post <title>');
    return false;
  }

  var now = moment();

  var filename = (hexo.config.new_post_name || ':title')
    .replace(':year', now.year())
    .replace(':month', now.format('MM'))
    .replace(':day', now.format('DD'))
    .replace(':title', args.join('-').toLowerCase());

  if (!path.extname(filename)) filename += '.md';

  var date = now.format('YYYY-MM-DD HH:mm:ss'),
    target = hexo.source_dir + '_posts' + sep + filename;

  var content = [
    '---',
    'layout: post',
    'title: ' + args.join(' '),
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
        console.log('Post created at %s', clc.bold(target));
        hexo.emit('newPost', target);
      });
    }
  });
});

extend.console.register('new_page', 'Create a new page', function(args){
  if (!args.length){
    console.log('Usage: hexo new_page <title>');
    return false;
  }

  var date = moment().format('YYYY-MM-DD HH:mm:ss'),
    target = hexo.source_dir + args.join('-').toLowerCase() + sep + 'index.md';

  var content = [
    '---',
    'layout: page',
    'title: ' + args.join(' '),
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
        console.log('Page created at %s', clc.bold(target));
        hexo.emit('newPage', target);
      });
    }
  });
});