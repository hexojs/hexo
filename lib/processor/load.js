// Based on: https://raw.github.com/imathis/octopress/master/plugins/backtick_code_block.rb

var extend = require('../extend'),
  renderer = Object.keys(extend.renderer.list()),
  tag = extend.tag.list(),
  render = require('../render'),
  util = require('../util'),
  file = util.file,
  yfm = util.yfm,
  highlight = util.highlight,
  path = require('path'),
  fs = require('fs'),
  async = require('async'),
  swig = require('swig'),
  _ = require('underscore'),
  config = hexo.config;

swig.init({tags: tag});

var regex = {
  codeBlock: /`{3} *([^\n]+)?\n(.+?)\n`{3}/,
  AllOptions: /([^\s]+)\s+(.+?)(https?:\/\/\S+)\s*(.+)?/i,
  LangCaption: /([^\s]+)\s*(.+)?/i
};

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
      meta.stats = stats;
      meta.path = source;

      if (meta.updated) meta.updated = _.isDate(meta.updated) ? moment(meta.date) : moment(meta.date, 'YYYY-MM-DD HH:mm:ss');
      else meta.updated = moment(stats.mtime);

      var compiled = swig.compile(meta._content)().replace(regex.codeBlock, function(match, args, str){
        if (!args) return match;

        var captionPart = args.match(regex.AllOptions);
        if (captionPart){
          var lang = captionPart[1],
            caption = '<span>' + captionPart[2] + '</span><a href="' + captionPart[3] + '">' + (captionPart[4] ? captionPart[4] : 'link') + '</a>';
        } else {
          var captionPart = args.match(regex.LangCaption);

          if (!captionPart[2]) return match;

          if (captionPart){
            var lang = captionPart[1],
              caption = '<span>' + captionPart[2] + '</span>';
          }
        }

        return '<notextile>' + highlight(str, {lang: lang, caption: caption}) + '</notextile>';
      });
      
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
  var extname = path.extname(source),
    filename = path.basename(source, extname);

  load(source, function(meta){
    if (_.isArray(meta.tags)){
      meta.tags = _.map(meta.tags, function(item){
        return {
          name: item,
          permalink: config.tag_dir + '/' + item + '/'
        };
      });
    } else if (meta.tags) {
      var postTag = meta.tags.toString();
      meta.tags = [{name: postTag, permalink: config.tag_dir + '/' + postTag + '/'}];
    }

    if (category){
      var categories = category.split(path.sep);

      meta.categories = [];

      _.each(categories, function(item, i){
        meta.categories.push({
          name: item,
          permalink: categories.slice(0, i + 1).join('/') + '/'
        });
      });
    }

    var date = meta.date;

    if (meta.permalink){
      var link = meta.permalink;
      if (!path.extname(link) && link.substr(link.length - 1, 1) !== '/') meta.permalink += '/';
    } else {
      if (config.permalink){
        if (!path.extname(config.permalink) && config.permalink.substr(config.permalink.length - 1, 1) !== '/') config.permalink += '/';

        meta.permalink = config.permalink
          .replace(/:category/, category ? category : config.category_dir)
          .replace(/:year/, date.format('YYYY'))
          .replace(/:month/, date.format('MM'))
          .replace(/:day/, date.format('DD'))
          .replace(/:title/, filename);
      } else {
        meta.permalink = date.format('YYYY/MM/DD') + '/' + filename;
      }
    }

    callback(meta);
  });
};

var loadPage = function(source, category, callback){
  var extname = path.extname(source);

  load(source, function(meta){
    if (meta.permalink){
      var link = meta.permalink;

      if (!path.extname(link)){
        if (link.substr(link.length - 1, 1) === '/'){
          meta.permalink += 'index.html';
        } else {
          meta.permalink += '/index.html';
        }
      }
    } else {
      meta.permalink = category.replace(extname, '.html');
    }

    callback(meta);
  });
};

extend.processor.register(function(locals, callback){
  var source = hexo.source_dir;

  console.log('Loading source files.');

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

        if (_.indexOf(renderer, extname.substring(1)) !== -1){
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

        if (_.indexOf(renderer, extname.substring(1)) !== -1){
          loadPage(source + item, item, function(page){
            locals.pages.push(page);
            next();
          });
        } else {
          file.copy(source + item, hexo.public_dir + item, next);
        }
      }
    }, function(err){
      callback(err, locals);
    });
  });
});