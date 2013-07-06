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
  var layout = data.layout || config.default_layout,
    date = data.date = moment(data.date || Date.now());

  layout = layout.toLowerCase();

  async.auto({
    // Check if the target exists
    target: function(next){
      getFilename(data, function(err, target){
        if (err) return next(err);

        next(null, target);
      })
    },
    // Load the scaffold
    scaffold: function(next){
      getScaffold(layout, next);
    },
    // Write content
    content: ['target', 'scaffold', function(next, results){
      data.date = date.format('YYYY-MM-DD HH:mm:ss');

      var content = swig.compile(results.scaffold)(data);

      if (data.content){
        var obj = _.extend(yfm(content), data.content);
        obj.date = moment(obj.date).format('YYYY-MM-DD HH:mm:ss');
        content = yfm.stringify(obj);
      }

      file.writeFile(results.target, content, function(err){
        if (err) return next(err);

        next(null, content);
      });
    }]
  }, function(err, results){
    if (err) return callback(err);

    callback(null, results.target, results.content);
  });
};

var getFilename = create.getFilename = function(data, callback){
  var slug = escape(data.slug || data.title, config.filename_case),
    layout = data.layout || config.default_layout,
    date = moment(data.date || Date.now()),
    target = sourceDir;

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

  if (data.replace) return callback(null, target);

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

// TODO getScaffold
var getScaffold = create.getScaffold = function(layout, callback){
  async.waterfall([
    // Check if the scaffold folder exists
    function(next){
      fs.exists(scaffoldDir, function(exist){
        next(null, exist);
      });
    },
    // Load the scaffold file
    function(exist, next){
      if (!exist) return next(null, null);

      file.list(scaffoldDir, function(err, files){
        if (err) return next(err);

        for (var i = 0, len = files.length; i < len; i++){
          var item = files[i];

          if (path.basename(item, path.extname(item)) === layout){
            var scaffoldPath = scaffoldDir + item;
            break;
          }

          if (!scaffoldPath) return next(null, null);

          file.readFile(scaffoldPath, next);
        }
      });
    },
    // Load the default scaffold
    function(scaffold, next){
      if (scaffold) return next(null, scaffold);

      if (layout === 'post' || layout === 'draft'){
        scaffold = scaffolds.post;
      } else if (layout === 'page'){
        scaffold = scaffolds.page;
      } else {
        scaffold = scaffolds.normal;
      }

      next(null, scaffold);
    }
  ], callback);
};