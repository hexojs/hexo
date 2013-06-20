var moment = require('moment'),
  fs = require('graceful-fs'),
  async = require('async'),
  path = require('path'),
  swig = require('swig'),
  yaml = require('yamljs'),
  _ = require('lodash'),
  util = require('./util'),
  file = util.file2,
  yfm = util.yfm,
  escape = util.escape.filename,
  config = hexo.config,
  sourceDir = hexo.source_dir,
  scaffoldDir = hexo.scaffold_dir;

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

var create = module.exports = function(data, callback){
  var slug = escape(data.slug || data.title, config.filename_case),
    layout = data.layout || config.default_layout,
    date = moment(data.date) || moment(),
    target = sourceDir,
    scaffold;

  layout = layout.toLowerCase();

  if (layout === 'page'){
    target += slug + '/index.md';
  } else {
    var filename = config.new_post_name
      .replace(':year', date.year())
      .replace(':month', date.format('MM'))
      .replace(':day', date.format('DD'))
      .replace(':title', slug);

    if (!path.extname(filename)) filename += '.md';

    target += (layout === 'draft' ? '_drafts/' : '_posts/') + filename;
  }

  async.auto({
    // Check if the target exists
    check: function(next){
      if (data.replace) return next();

      getFilename(target, function(err, _target){
        if (err) return next(err);

        target = _target;
        next();
      });
    },
    // Load the scaffold
    scaffold: ['check', function(next){
      fs.exists(scaffoldDir, function(exist){
        if (!exist) return next();

        file.list(scaffoldDir, function(err, files){
          if (err) return next(err);

          for (var i = 0, len = files.length; i < len; i++){
            var item = files[i];

            if (path.basename(item, path.extname(item)) === layout){
              var scaffoldPath = scaffoldDir + item;
              break;
            }
          }

          if (scaffold){
            file.readFile(scaffoldPath, function(err, content){
              if (err) return callback(err);

              scaffold = content;
              next();
            });
          } else {
            next();
          }
        });
      });
    }],
    // Load the default scaffold
    default_scaffold: ['scaffold', function(next){
      if (scaffold) return next();

      if (layout === 'post' || layout === 'draft'){
        scaffold = scaffolds.post;
      } else if (layout === 'page'){
        scaffold = scaffolds.page;
      } else {
        scaffold = scaffolds.normal;
      }

      next();
    }],
    // Write content
    content: ['default_scaffold', function(next){
      data.date = date.format('YYYY-MM-DD HH:mm:ss');

      var content = swig.compile(scaffold)(data);

      if (data.content){
        var obj = _.extend(yfm(content), data.content);
        obj.date = moment(obj.date).format('YYYY-MM-DD HH:mm:ss');
        content = yfm.stringify(obj);
      }

      file.writeFile(target, content, function(err){
        if (err) return next(err);

        next(null, content);
      });
    }]
  }, function(err, results){
    if (err) return callback(err);

    callback(null, target, results.content);
  });
};

var getFilename = create.getFilename = function(target, callback){
  fs.exists(target, function(exist){
    if (!exist) return callback(null, target);

    // If the target exists, check the parent folder to rename the file. e.g. target-1.md
    fs.readdir(path.dirname(target), function(err, files){
      if (err) return callback(err);

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

      target = target.substring(0, target.length - extname.length) + '-' + max + extname;
      callback(null, target);
    });
  });
};