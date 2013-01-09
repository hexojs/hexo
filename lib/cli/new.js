var moment = require('moment'),
  clc = require('cli-color'),
  fs = require('graceful-fs'),
  path = require('path'),
  sep = path.sep,
  extend = require('../extend'),
  util = require('../util'),
  file = util.file;

var downcase = function(str){
  return str.toLowerCase().replace(/\s/g, '-');
};

extend.console.register('new', 'Create a new article', function(args){
  if (!args.length){
    console.log('Usage: hexo new [layout] <title>');
    return false;
  }

  var title = args.pop(),
    layout = args.length ? args[0] : 'post',
    now = moment(),
    target = hexo.source_dir;

  if (layout === 'page'){
    target += downcase(title) + sep + 'index.md';
  } else {
    var filename = (hexo.config.new_post_name || ':title.md')
      .replace(':year', now.year())
      .replace(':month', now.format('MM'))
      .replace(':day', now.format('DD'))
      .replace(':title', downcase(title));

    if (!path.extname(filename)) filename += '.md';

    if (layout === 'draft'){
      target += '_drafts' + sep;
    } else {
      target += '_posts' + sep;
    }

    target += filename;
  }

  var content =
    '---\n' +
    (layout !== 'post' && layout !== 'page' && layout !== 'draft' ? 'layout: ' + layout + '\n' : '') +
    'title: ' + title + '\n' +
    'date: ' + now.format('YYYY-MM-DD HH:mm:ss') + '\n' +
    (layout !== 'page' ? 'tags: \n' : '') +
    '---\n\n';

  fs.exists(target, function(exist){
    if (exist){
      console.log('%s already exists. Use other title instead.', clc.bold(target));
    } else {
      file.write(target, content, function(err){
        if (err) throw new Error('I/O Error: ' + target);
        console.log('Page created at %s', clc.bold(target));
        hexo.emit('new', target);
      });
    }
  });
});