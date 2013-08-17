var async = require('async'),
  pathFn = require('path'),
  moment = require('moment'),
  util = require('../../util'),
  yfm = util.yfm,
  escape = util.escape.path;

var config = hexo.config,
  renderFn = hexo.render,
  isRenderable = renderFn.isRenderable,
  renderPost = renderFn.renderPost;

var model = hexo.model,
  Post = model('Post');

var rBasename = /((.*)\/)?([^\/]+)\.(\w+)$/;

var getInfoFromFilename = function(path){
  var config = config.new_post_name,
    params = [];

  var pattern = pathFn.basename(config, pathFn.extname(config))
    .replace(/(\/|\.)/g, '\\$&')
    .replace(/:(\d+)/g, function(match, name){
      if (name === 'year'){
        params.push(name);
        return '(\\d{4})';
      } else if (name === 'month' || name === 'day'){
        params.push(name);
        return '(\\d{2})';
      } else if (name === 'title'){
        params.push(name);
        return '(.*)';
      } else {
        return '';
      }
    });

  var regex = new RegExp('^' + pattern + '$');

  if (!regex.test(path)) return;

  var match = path.match(regex),
    results = {};

  for (var i = 1, len = match.length; i <= len; i++){
    result[params[i - 1]] = match[i];
  }

  return result;
};

module.exports = function(data, callback){
  var path = data.params.path;

  if (!isRenderable(path)) return;

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
    }
  }, function(err, results){
    if (err) return callback(err);

    var stat = results.stat,
      meta = yfm(results.read);

    meta.content = meta._content;
    delete meta._content;

    meta.source = data.path;
    meta.raw = results.read;
    meta.slug = escape(path.match(rBasename)[3]);

    if (meta.date){
      if (!(meta.date instanceof Date)){
        meta.date = moment(meta.date, 'YYYY-MM-DD HH:mm:ss').toDate();
      }
    } else {
      var match = getInfoFromFilename(path);

      if (match && match.year && match.month && match.day){
        meta.date = new Date(match.year, match.month - 1, match.day);
        meta.slug = match.title;
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

    renderPost(meta, function(err, meta){
      if (err) return callback(err);

      if (doc){
        doc.replace(meta, function(){
          callback();
        });
      } else {
        Post.insert(meta, function(){
          callback();
        });
      }
    });
  });
};