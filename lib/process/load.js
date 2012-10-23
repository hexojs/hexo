var extend = require('../extend'),
  render = extend.render.list(),
  tag = extend.tag.list(),
  render = require('../render'),
  util = require('../util'),
  file = util.file,
  yfm = util.yfm,
  path = require('path'),
  fs = require('fs'),
  async = require('async'),
  swig = require('swig'),
  _ = require('underscore');

swig.init({tags: tag});

var load = function(source, callback){
  var extname = path.extname(source),
    moment = require('../moment');

  async.waterfall([
    function(next){
      file.read(source, function(err, result){
        if (err) throw err;

        fs.stat(source, function(err, stats){
          if (err) throw err;
          next(null, result, stats);
        });
      });
    },
    function(file, stats, next){
      var meta = yfm(file);

      meta.date = _.isDate(meta.date) ? moment(meta.date) : moment(meta.date, 'YYYY-MM-DD HH:mm:ss');
      meta.updated = moment(stats.mtime);
      meta.stats = stats;

      var compiled = swig.compile(meta._content)();
      
      render.render(compiled, extname.substring(1), function(err, result){
        if (err) throw err;

        delete meta._content;
        meta.content = result.replace(/<\/?notextile>/g, '');

        callback(meta);
      });
    }
  ]);
};

var loadPost = function(source, category, callback){
  var config = hexo.config,
    extname = path.extname(source),
    filename = path.basename(source, extname);

  load(source, function(meta){
    if (_.isArray(meta.tags)){
      meta.tags = _.map(meta.tags, function(item){
        return {
          name: item,
          permalink: config.tag_dir + '/' + item + '/'
        };
      });
    } else if (_.isString(meta.tags)){
      meta.tags = [{name: meta.tags, permalink: config.tag_dir + '/' + meta.tags + '/'}];
    }

    if (category){
      var categories = category.split(path.sep);

      meta.categories = [];

      _.each(categories, function(item, i){
        meta.categories.push({
          name: item,
          permalink: categories.slice(0, i + 1).join('/' + '/')
        });
      });
    }

    var date = meta.date;

    meta.permalink = config.permalink
      .replace(/:category/, category ? category : config.category_dir)
      .replace(/:year/, date.format('YYYY'))
      .replace(/:month/, date.format('MM'))
      .replace(/:day/, date.format('DD'))
      .replace(/:title/, filename);

    callback(meta);
  });
};

var loadPage = function(source, category, callback){
  var extname = path.extname(source);

  load(source, function(meta){
    meta.permalink = category.replace(extname, '.html');

    callback(meta);
  });
};

extend.process.register(function(locals, callback){
  var source = hexo.source_dir;

  file.dir(source, function(files){
    async.forEach(files, function(item, next){
      var extname = path.extname(item),
        dirs = item.split('/');

      if (dirs[0] === '_posts'){
        var category = dirs.slice(1);

        for (var i=0, len=category.length; i<len; i++){
          var front = category[i].substring(0, 1);

          if (front === '_' || front === '.'){
            return next();
          }
        }

        if (_.indexOf(render, extname.substring(1))){
          loadPost(source + item, category.reverse().slice(1).reverse().join('/'), function(post){
            locals.posts.push(post);
            next();
          });
        } else {
          next();
        }
      } else {
        for (var i=0, len=dirs.length; i<len; i++){
          var front = dirs[i].substring(0, 1);

          if (front === '_' || front === '.'){
            return next();
          }
        }

        if (_.indexOf(render, extname.substring(1))){
          loadPage(source + item, item, function(page){
            locals.pages.push(page);
            next();
          });
        } else {
          file.copy(source + item, hexo.public_dir + item, next);
        }
      }
    }, function(err){
      console.log('Source file loaded.');
      callback(err, locals);
    });
  });
});