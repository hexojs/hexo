var moment = require('moment'),
  util = require('../util'),
  file = util.file,
  log = util.log;

exports.post = function(args){
  var slug = args[0];

  if (slug === undefined) return false;

  var date = moment().format('YYYY-MM-DD HH:mm:ss'),
    root = process.cwd(),
    target = '/source/_posts/' + slug + '.md';

  var content = [
    '---',
    'layout: post',
    'title: ' + slug,
    'date: ' + date,
    'comments: true',
    'tags:',
    '---'
  ];

  file.write(root + target, content.join('\n') + '\n', function(err){
    if (err) throw err;
    log.success('Post created in %s', target);
  });
};

exports.page = function(args){
  var slug = args[0];

  if (slug === undefined) return false;

  var date = moment().format('YYYY-MM-DD HH:mm:ss'),
    root = process.cwd(),
    target = '/source/' + slug + '/index.md';

  var content = [
    '---',
    'layout: page',
    'title: ' + slug,
    'date: ' + date,
    'comments: true',
    '---'
  ];

  file.write(root + target, content.join('\n') + '\n', function(err){
    if (err) throw err;
    log.success('Page created in %s', target);
  });
};