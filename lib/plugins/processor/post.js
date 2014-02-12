var async = require('async'),
  pathFn = require('path'),
  moment = require('moment'),
  fs = require('fs'),
  util = require('../../util'),
  yfm = util.yfm,
  file = util.file2,
  escape = util.escape.path;

var rBasename = /((.*)\/)?([^\/]+)\.(\w+)$/,
  rHiddenFile = /^_|\/_|[~%]$/;

var getInfoFromFilename = function(path){
  var newPostName = hexo.config.new_post_name,
    params = [];

  path = path.substring(0, path.length - pathFn.extname(path).length);

  var pattern = newPostName.substring(0, newPostName.length - pathFn.extname(newPostName).length)
    .replace(/(\/|\.)/g, '\\$&')
    .replace(/:(\w+)/g, function(match, name){
      switch (name){
        case 'year':
          params.push(name);
          return '(\\d{4})';
        case 'i_month':
        case 'i_day':
          params.push(name);
          return '(\\d{1,2})';
        case 'month':
        case 'day':
          params.push(name);
          return '(\\d{2})';
        case 'title':
          params.push(name);
          return '(.*)';
        default:
          return '';
      }
    });

  var regex = new RegExp('^' + pattern + '$');

  if (!regex.test(path)) return;

  var match = path.match(regex),
    result = {};

  for (var i = 1, len = match.length; i <= len; i++){
    if (match[i]) result[params[i - 1]] = match[i];
  }

  return result;
};

var _scanPostAssets = function(post, callback){
  var assetDir = post.asset_dir;

  fs.exists(assetDir, function(exist){
    if (!exist) return callback();

    file.list(assetDir, {ignorePattern: rHiddenFile}, function(err, files){
      if (err) return callback(err);

      var PostAsset = hexo.model('PostAsset');

      async.each(files, function(item, next){
        PostAsset.updateStat(post, item, next);
      }, callback);
    });
  });
};

module.exports = function(data, callback){
  var config = hexo.config,
    renderFn = hexo.render,
    isRenderable = renderFn.isRenderable;

  var model = hexo.model,
    Post = model('Post');

  var path = data.params.path;

  if (!isRenderable(path)) return callback();

  // Ignore file/folder name started with `_`
  if (/\/_/.test(path)) return callback();

  // Ignore editor tmp file
  if (/[~%]$/.test(path)) return callback();

  var doc = Post.findOne({source: data.path});

  if (data.type === 'delete' && doc){
    hexo.route.remove(doc.path);
    doc.remove();

    return callback();
  }

  async.auto({
    stat: function(next){
      data.stat(next);
    },
    read: function(next){
      data.read({cache: true}, next);
    },
    post: ['stat', 'read', function(next, results){
      var stat = results.stat,
        meta = yfm(results.read);

      meta.content = meta._content;
      delete meta._content;

      meta.source = data.path;
      meta.raw = results.read;
      meta.slug = escape(path.match(rBasename)[3]);

      var filenameInfo = getInfoFromFilename(path);

      if (filenameInfo && filenameInfo.title) meta.slug = filenameInfo.title;

      if (meta.date){
        if (!(meta.date instanceof Date)){
          meta.date = moment(meta.date, 'YYYY-MM-DD HH:mm:ss').toDate();
        }
      } else {
        if (filenameInfo && filenameInfo.year && (filenameInfo.month || filenameInfo.i_month) && (filenameInfo.day || filenameInfo.i_day)){
          meta.date = new Date(
            filenameInfo.year,
            parseInt(filenameInfo.month || filenameInfo.i_month, 10) - 1,
            parseInt(filenameInfo.day || filenameInfo.i_day, 10)
          );
        } else {
          meta.date = stat.ctime;
        }
      }

      if (meta.updated){
        if (!(meta.updated instanceof Date)){
          meta.updated = moment(meta.updated, 'YYYY-MM-DD HH:mm:ss').toDate();
        }
      } else {
        meta.updated = (hexo.config.sort_by == 'auto') ?  stat.mtime : meta.date;
      }

      if (meta.permalink){
        var link = meta.slug = escape(meta.permalink);
        if (!pathFn.extname(link) && link[link.length - 1] !== '/') link += '/';
        delete meta.permalink;
      }

      if (meta.category){
        meta.categories = meta.category;
        delete meta.category;
      }

      if (meta.categories && !Array.isArray(meta.categories)){
        meta.categories = [meta.categories];
      }

      if (meta.tag){
        meta.tags = meta.tag;
        delete meta.tag;
      }

      if (meta.tags && !Array.isArray(meta.tags)){
        meta.tags = [meta.tags];
      }

      if (meta.photo){
        meta.photos = meta.photo;
        delete meta.photo;
      }

      if (meta.photos && !Array.isArray(meta.photos)){
        meta.photos = [meta.photos];
      }

      if (meta.link && !meta.title){
        meta.title = meta.link
          .replace(/^https?:\/\//, '')
          .replace(/\/$/, '');
      }

      hexo.post.render(data.source, meta, function(err, meta){
        if (err) return next(err);

        if (doc){
          doc.replace(meta, function(post){
            next(null, post);
          });
        } else {
          Post.insert(meta, function(post){
            next(null, post);
          });
        }
      });
    }],
    asset: ['post', function(next, results){
      if (!config.post_asset_folder) return next();

      _scanPostAssets(results.post, next);
    }]
  }, callback);
};
