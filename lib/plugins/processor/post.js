var async = require('async'),
  moment = require('moment'),
  fs = require('graceful-fs'),
  pathFn = require('path'),
  _ = require('lodash'),
  url = require('url'),
  util = require('../../util'),
  yfm = util.yfm,
  escape = util.escape,
  Permalink = util.permalink,
  file = util.file2;

var rBasename = /((.*)\/)?([^\/]+)\.(\w+)$/,
  regex = require('./index').regex,
  preservedKeys = ['title', 'year', 'month', 'day', 'i_month', 'i_day'],
  permalink;

var scanAssetDir = function(post, callback){
  var assetDir = post.asset_dir,
    postPath = post.path,
    baseDir = hexo.base_dir,
    baseDirLength = baseDir.length,
    Asset = hexo.model('Asset'),
    Post = hexo.model('Post');

  fs.exists(assetDir, function(exist){
    if (!exist) return callback();

    file.list(assetDir, function(err, files){
      if (err) return callback(err);

      async.each(files, function(item, next){
        if (!regex.hiddenFile.test(item)) return next();
        if (regex.tmpFile.test(item)) return next();

        var source = pathFn.join(assetDir, item).substring(baseDirLength),
          asset = Asset.get(source);

        if (asset){
          if (asset.post_path === postPath) return next();

          hexo.route.remove(asset.path);

          asset.update({
            path: url.resolve(postPath, item),
            modified: true,
            post_id: post._id,
            postPath: postPath
          }, function(){
            next();
          });
        } else {
          Asset.insert({
            _id: source,
            path: url.resolve(postPath, item),
            modified: true,
            post_id: post._id,
            post_path: postPath
          }, function(){
            next();
          });
        }
      }, callback);
    });
  });
};

module.exports = function(data, callback){
  var config = hexo.config,
    path = data.params.path;

  var Post = hexo.model('Post'),
    doc = Post.findOne({source: data.path});

  if (data.type === 'skip' && doc){
    return callback();
  }

  if (data.type === 'delete'){
    if (doc){
      hexo.route.remove(doc.path);
      doc.remove();
    }

    return callback();
  }

  async.auto({
    stat: function(next){
      data.stat(next);
    },
    read: function(next){
      data.read(next);
    },
    post: ['stat', 'read', function(next, results){
      var stat = results.stat,
        meta = yfm(results.read);

      meta.content = meta._content;
      delete meta._content;

      meta.source = data.path;
      meta.raw = results.read;
      meta.slug = escape.path(path.match(rBasename)[3]);

      var newPostName = config.new_post_name;
      newPostName = newPostName.substring(0, newPostName.length - pathFn.extname(newPostName).length);

      if (!permalink || permalink.rule !== newPostName){
        permalink = new Permalink(newPostName, {
          segments: {
            year: /(\d{4})/,
            month: /(\d{2})/,
            day: /(\d{2})/,
            i_month: /(\d{1,2})/,
            i_day: /(\d{1,2})/
          }
        });
      }

      var filenameInfo = permalink.parse(path.substring(0, path.length - pathFn.extname(path).length));

      if (filenameInfo){
        if (filenameInfo.title) meta.slug = filenameInfo.title;

        _.difference(Object.keys(filenameInfo), preservedKeys).forEach(function(i){
          meta[i] = filenameInfo[i];
        });
      }

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
        meta.updated = stat.mtime;
      }

      if (meta.permalink){
        var link = meta.slug = escape.path(meta.permalink);
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
          .replace(/^https?:\/\/|\/$/g, '');
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

      scanAssetDir(results.post, next);
    }]
  }, callback);
};