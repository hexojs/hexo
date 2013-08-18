var async = require('async'),
  fs = require('graceful-fs'),
  pathFn = require('path'),
  moment = require('moment'),
  util = require('../../util'),
  yfm = util.yfm,
  escape = util.escape.path;

var renderFn = hexo.render,
  isRenderable = renderFn.isRenderable,
  // renderPost = renderFn.renderPost,
  route = hexo.route;

var model = hexo.model,
  Page = model('Page'),
  Asset = model('Asset');

module.exports = function(data, callback){
  var path = data.path;

  // Ignore editor tmp file
  if (/[~%]$/.test(path)) return callback();

  if (isRenderable(path)){
    var doc = Page.findOne({source: path});

    if (data.type === 'delete' && doc){
      route.remove(path);
      doc.remove();

      return callback();
    }

    async.auto({
      stat: function(next){
        data.stat(next);
      },
      read: function(next){
        data.read({cache: true}, next);
      }
    }, function(err, results){
      if (err) return callback(err);

      var stat = results.stat,
        meta = yfm(results.read);

      meta.content = meta._content;
      delete meta._content;

      meta.source = path;
      meta.raw = results.read;

      if (meta.date){
        if (!(meta.date instanceof Date)){
          meta.date = moment(meta.date, 'YYYY-MM-DD HH:mm:ss').toDate();
        }
      } else {
        meta.date = stat.ctime;
      }

      if (meta.updated){
        if (!(meta.updated instanceof Date)){
          meta.updated = moment(meta.updated, 'YYYY-MM-DD HH:mm:ss').toDate();
        }
      } else {
        meta.updated = stat.mtime;
      }

      if (meta.permalink){
        var link = meta.permalink;
        delete meta.permalink;
      } else {
        var link = path;
      }

      if (!pathFn.extname(link)){
        if (link[link.length - 1] === '/'){
          link += 'index.html';
        } else {
          link += '/index.html';
        }
      }

      meta.path = link;

      hexo.post.render(data.source, meta, function(err, meta){
        if (err) return callback(err);

        if (doc){
          doc.replace(meta, function(){
            callback();
          });
        } else {
          Page.insert(meta, function(){
            callback();
          });
        }
      });
    });
  } else {
    var src = pathFn.join('source', path),
      doc = Asset.findOne({source: src});

    if (data.type === 'delete' && doc){
      route.remove(path);
      doc.remove();

      return callback();
    }

    Asset.checkModified(src, function(err, modified){
      if (err) return callback(err);

      var content = function(fn){
        fn(null, fs.createReadStream(data.source));
      };

      content.modified = modified;

      route.set(path, content);
      callback();
    });
  }
};