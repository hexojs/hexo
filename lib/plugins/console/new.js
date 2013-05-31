var moment = require('moment'),
  term = require('term'),
  fs = require('graceful-fs'),
  async = require('async'),
  path = require('path'),
  swig = require('swig'),
  extend = require('../../extend'),
  util = require('../../util'),
  file = util.file;

// http://en.wikipedia.org/wiki/Filename#Reserved_characters_and_words
var escape = function(str){
  return str.toString().toLowerCase()
    .replace(/\s/g, '-')
    .replace(/\/|\\|\?|%|\*|:|\||"|<|>|\.|#/g, '');
};

// Default scaffolds
var scaffolds = {
  post: [
    'title: {{ title }}',
    'date: {{ date }}',
    'tags:',
    '---'
  ].join('\n') + '\n',
  page: [
    'title: {{ title }}',
    'date: {{ date }}',
    '---'
  ].join('\n') + '\n',
  normal: [
    'layout: {{ layout }}',
    'title: {{ title }}',
    'date: {{ date }}',
    'tags:',
    '---'
  ].join('\n') + '\n'
};

extend.console.register('new', 'Create a new article', {alias: 'n'}, function(args, callback){
  if (!args._.length){
    console.log('Usage: hexo new [layout] <title>');
    return false;
  }

  var config = hexo.config,
    defaultLayout = config.default_layout,
    title = args._.pop(),
    layout = args._.length ? args._[0] : defaultLayout,
    now = moment(),
    target = hexo.source_dir,
    scaffoldDir = hexo.scaffold_dir;

  if (layout === 'page'){
    target += escape(title) + '/index.md';
  } else {
    var filename = config.new_post_name
      .replace(':year', now.year())
      .replace(':month', now.format('MM'))
      .replace(':day', now.format('DD'))
      .replace(':title', escape(title));

    if (!path.extname(filename)) filename += '.md';

    if (layout === 'draft'){
      target += '_drafts/';
    } else {
      target += '_posts/';
    }

    target += filename;
  }

  async.waterfall([
    // Check whether the target exists
    function(next){
      fs.exists(target, function(exist){
        if (!exist) return next();
        // If target exists, check the parent folder to rename the target. e.g. target-1.md
        var parent = path.dirname(target);

        fs.exists(parent, function(exist){
          if (!exist) return next();

          fs.readdir(parent, function(err, files){
            if (err) throw new Error('Failed to read directory: ' + parent);

            var extname = path.extname(target),
              basename = path.basename(target, extname),
              regex = new RegExp('^' + basename + '-?(\\d+)?'),
              max = 0;

            files.forEach(function(item){
              var match = path.basename(item, path.extname(item)).match(regex);

              if (match){
                var num = match[1];

                if (num){
                  if (num >= max){
                    max = parseInt(num) + 1;
                  }
                } else {
                  if (max == 0){
                    max = 1;
                  }
                }
              }
            });

            if (max > 0) target = target.substring(0, target.length - extname.length) + '-' + max + extname;
            next();
          });
        });
      });
    },
    // Load the scaffold
    function(next){
      fs.exists(scaffoldDir, function(exist){
        if (!exist) return next(null, undefined);
        file.dir(scaffoldDir, function(files){
          for (var i=0, len=files.length; i<len; i++){
            var item = files[i];
            if (path.basename(item, path.extname(item)) === layout){
              var scaffold = scaffoldDir + item;
              break;
            }
          }

          if (!scaffold){
            next(null, undefined);
          } else {
            file.read(scaffold, next);
          }
        });
      })
    },
    // Use the default scaffold if the scaffold not exists
    function(scaffold, next){
      if (!scaffold){
        if (layout === 'post' || layout === 'draft'){
          scaffold = scaffolds.post;
        } else if (layout === 'page'){
          scaffold = scaffolds.page;
        } else {
          scaffold = scaffolds.normal;
        }
      }

      next(null, scaffold);
    },
    // Write content
    function(scaffold, next){
      var content = swig.compile(scaffold)({layout: layout, title: title, date: now.format('YYYY-MM-DD HH:mm:ss')});

      file.write(target, content, function(err){
        if (err) throw new Error('Failed to write file:' + target);
        console.log('File created at %s', target.bold);
        hexo.emit('new', target);
        callback();
      });
    }
  ]);
});
