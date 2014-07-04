var async = require('async'),
  pathFn = require('path'),
  moment = require('moment'),
  util = require('../../util'),
  yfm = util.yfm;

module.exports = function(data, callback){
  var Page = hexo.model('Page'),
    path = data.path,
    doc = Page.findOne({source: path}),
    getOutput = hexo.render.getOutput;

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
      data.read({cache: true}, next);
    }
  }, function(err, results){
    if (err) return callback(err);

    var stat = results.stat,
      link = '',
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
      link = meta.permalink;
      delete meta.permalink;

      if (!pathFn.extname(link)){
        link += (link[link.length - 1] === '/' ? '' : '/') + 'index.' + getOutput(path);
      }
    } else {
      var extname = pathFn.extname(path);
      link = path.substring(0, path.length - extname.length + 1) + getOutput(path);
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
};
