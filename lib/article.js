var helper = require('./extend').helper.list(),
  render = require('./render'),
  theme = require('./theme'),
  util = require('./util'),
  file = util.file,
  yfm = util.yfm,
  async = require('async'),
  fs = require('fs'),
  path = require('path'),
  swig = require('swig'),
  _ = require('underscore');

swig.init({tags: helper});

var regex = {
  excerpt: /<!--\s*more\s*-->/
};

var load = function(source, callback){
  var extname = path.extname(source),
    moment = require('./moment');

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

      render.render(meta._content, extname, function(err, result){
        if (err) throw err;

        var result = swig.compile(result)();        
        delete meta._content;

        if (result.match(regex.excerpt)){
          meta.content = result.replace(regex.excerpt, '<span id="more"></span>');
          meta.excerpt = result.split(regex.excerpt)[0];
        } else {
          meta.content = result;
        }

        callback(meta);
      });
    }
  ]);
};

exports.loadPost = function(source, category, callback){
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

      for (var i=0, len=categories.length; i<len; i++){
        var item = categories[i];

        meta.categories.push({
          name: item,
          permalink: categories.slice(0, i + 1).join('/') + '/'
        });
      }
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

exports.loadPage = function(source, category, callback){
  var extname = path.extname(source);

  load(source, function(meta){
    meta.permalink = category.replace(extname, '.html');

    callback(meta);
  });
};