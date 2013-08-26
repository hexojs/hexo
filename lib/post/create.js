/**
 * Module dependencies.
 */

var async = require('async'),
  fs = require('graceful-fs'),
  path = require('path'),
  moment = require('moment'),
  swig = require('swig'),
  util = require('../util'),
  file = util.file2,
  yfm = util.yfm,
  escape = util.escape.filename;

var config = hexo.config,
  scaffoldDir = hexo.scaffold_dir,
  sourceDir = hexo.source_dir;

/**
 * Default scaffolds.
 */

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

/**
 * Creates a new post file.
 *
 * Data properties:
 *
 *   - `date`: Created date
 *   - `slug`: Slug
 *   -` title`: Title
 *   - `layout`: Layout
 *
 * @param {Object} data
 * @param {Boolean} [replace]
 * @param {Function} callback
 * @api public
 */

var create = module.exports = function(data, replace, callback){
  if (!callback){
    if (typeof replace === 'function'){
      callback = replace;
      replace = false;
    } else {
      callback = function(){};
    }
  }

  var layout = data.layout || config.default_layout,
    date = data.date ? moment(data.date) : moment();

  layout = layout.toLowerCase();

  async.parallel([
    // Check whether the target exists
    function(next){
      getFilename(data, replace, next);
    },
    // Load the scaffold
    function(next){
      getScaffold(layout, next);
    }
  ], function(err, results){
    if (err) return callback(err);

    var target = results[0],
      scaffold = results[1];

    data.date = date.format('YYYY-MM-DD HH:mm:ss');

    var content = swig.compile(scaffold)(data);

    file.writeFile(target, content, function(err){
      if (err) return callback(err);

      callback(null, target, content);
      hexo.emit('new', target, content);
    });
  });
};

/**
 * Gets an available filename.
 *
 * Data properties:
 *
 *   - `date`: Created date
 *   - `slug`: Slug
 *   -` title`: Title
 *   - `layout`: Layout
 *
 * @param {Object} data
 * @param {Boolean} [replace]
 * @param {Function} callback
 * @api public
 */

var getFilename = create.getFilename = function(data, replace, callback){
  if (!callback){
    if (typeof replace === 'function'){
      callback = replace;
      replace = false;
    } else {
      callback = function(){};
    }
  }

  var slug = escape(data.slug || data.title, config.filename_case),
    layout = data.layout || config.default_layout,
    date = data.date ? moment(data.date) : moment();

  layout = layout.toLowerCase();

  if (layout == 'page'){
    var target = path.join(sourceDir, slug, 'index.md');
  } else {
    var filename = config.new_post_name
      .replace(':year', date.year())
      .replace(':month', date.format('MM'))
      .replace(':i_month', date.format('M'))
      .replace(':day', date.format('DD'))
      .replace(':i_day', date.format('D'))
      .replace(':title', slug);

    if (!path.extname(filename)) filename += '.md';

    filename = filename.replace(/\//g, path.sep);

    var target = path.join(sourceDir, layout === 'draft' ? '_drafts' : '_posts', filename);
  }

  if (replace) return callback(null, target);

  fs.exists(target, function(exist){
    if (!exist) return callback(null, target);

    // If the target exists, check the parent folder and rename the file. e.g. target-1.md
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

/**
 * Gets the specified scaffold.
 *
 * @param {String} layout
 * @param {Function} callback
 * @api public
 */

var getScaffold = create.getScaffold = function(layout, callback){
  async.waterfall([
    // Check whether the scaffold folder exists
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
            var scaffoldPath = path.join(scaffoldDir, item);
            break;
          }

          if (!scaffoldPath) return next(null, null);

          file.readFile(scaffoldPath, next);
        }
      });
    },
    // Load the default scaffold
    function(scaffold, next){
      if (scaffold != null) return next(null, scaffold);

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