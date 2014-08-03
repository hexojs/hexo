var async = require('async'),
  path = require('path'),
  fs = require('graceful-fs'),
  _ = require('lodash'),
  util = require('../util'),
  file = util.file2,
  yfm = util.yfm,
  escape = util.escape;

var removeExtname = function(str){
  return str.substring(0, str.length - path.extname(str).length);
};

/**
* Publish a draft.
*
* @method publish
* @param {Object} data
*   @param {String} data.slug
*   @param {String} [data.layout]
*/

module.exports = function(data, replace, callback){
  if (!callback){
    if (typeof replace === 'function'){
      callback = replace;
      replace = false;
    } else {
      callback = function(){};
    }
  }

  if (data.layout === 'draft') data.layout = 'post';

  var config = hexo.config,
    draftDir = path.join(hexo.source_dir, '_drafts'),
    slug = data.slug = escape.filename(data.slug, config.filename_case),
    layout = data.layout = (data.layout || config.default_layout).toLowerCase();

  async.auto({
    // Find draft
    src: function(next){
      file.list(draftDir, function(err, files){
        if (err) return next(err);

        var regex = new RegExp('^' + escape.regex(slug));
          src = '';

        for (var i = 0, len = files.length; i < len; i++){
          var name = files[i];

          if (regex.test(name)){
            src = path.join(draftDir, name);
            break;
          }
        }

        if (src){
          next(null, src);
        } else {
          next(new Error('Draft "' + slug + '" does not exist.'));
        }
      });
    },
    // Create post
    post: ['src', function(next, results){
      file.readFile(results.src, function(err, content){
        if (err) return next(err);

        _.extend(data, yfm(content));

        data.content = data._content;
        delete data._content;

        hexo.post.create(data, replace, function(err, src, content){
          if (err) return next(err);

          next(null, {
            path: src,
            content: content
          });
        });
      });
    }],
    // Remove draft file
    removePost: ['post', function(next, results){
      fs.unlink(results.src, next);
    }],
    // Copy assets
    asset: ['src', 'post', function(next, results){
      if (!config.post_asset_folder) return next();

      var src = removeExtname(results.src),
        dest = removeExtname(results.post.path);

      fs.exists(src, function(exist){
        if (!exist) return next();

        file.copyDir(src, dest, function(err){
          if (err) return next(err);

          next(null, src);
        });
      });
    }],
    // Remove original assets
    removeAsset: ['asset', function(next, results){
      if (!results.asset) return next();

      file.rmdir(results.asset, next);
    }]
  }, function(err, results){
    if (err) return callback(err);

    callback(null, results.src, results.post.content);
  });
};