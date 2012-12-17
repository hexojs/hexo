// Based on: https://raw.github.com/imathis/octopress/master/plugins/backtick_code_block.rb
var extend = require('../extend'),
  renderer = Object.keys(extend.renderer.list()),
  tag = extend.tag.list(),
  render = require('../render'),
  util = require('../util'),
  file = util.file,
  yfm = util.yfm,
  highlight = util.highlight,
  pathFn = require('path'),
  sep = pathFn.sep,
  fs = require('graceful-fs'),
  swig = require('swig'),
  async = require('async'),
  moment = require('moment'),
  _ = require('underscore'),
  config = hexo.config,
  sourceDir = hexo.source_dir,
  publicDir = hexo.public_dir,
  catDir = config.category_dir,
  tagDir = config.tag_dir + '/',
  siteUrl = config.url + '/',
  configLink = config.permalink;

swig.init({tags: tag});

var regex = {
  codeBlock: /`{3} *([^\n]+)?\n(.+?)\n`{3}/,
  AllOptions: /([^\s]+)\s+(.+?)(https?:\/\/\S+)\s*(.+)?/i,
  LangCaption: /([^\s]+)\s*(.+)?/i
};

var load = function(source, callback){
  var sourcePath = sourceDir + source;

  async.parallel([
    function(next){
      file.read(sourcePath, next);
    },
    function(next){
      fs.stat(sourcePath, next);
    }
  ], function(err, results){
    var meta = yfm(results[0]),
      stats = results[1],
      extname = pathFn.extname(sourcePath).substring(1);

    meta.date = _.isDate(meta.date) ? moment(meta.date) : moment(meta.date, 'YYYY-MM-DD HH:mm:ss');
    meta.stats = stats;
    meta.source = sourcePath;

    if (meta.updated) meta.updated = _.isDate(meta.updated) ? moment(meta.date) : moment(meta.date, 'YYYY-MM-DD HH:mm:ss');
    else meta.updated = moment(stats.mtime);

    var compiled = swig.compile(meta._content)().replace(regex.codeBlock, function(match, args, str){
      if (!args) return match;

      var captionPart = args.match(regex.AllOptions);
      if (captionPart){
        var lang = captionPart[1],
          caption = caption = '<span>' + captionPart[2] + '</span><a href="' + captionPart[3] + '">' + (captionPart[4] ? captionPart[4] : 'link') + '</a>';
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

    render.render(compiled, extname, function(err, result){
      if (err) throw err;
      delete meta._content;
      meta.content = result.replace(/<\/?notextile>/g, '');
      callback(meta);
    });
  });
};

var loadPost = function(source, category, callback){
  var extname = pathFn.extname(source),
    filename = pathFn.basename(source, extname);

  load(source, function(meta){
    var tags = meta.tags;

    if (_.isArray(tags)){
      meta.tags = _.map(tags, function(item){
        var tagPath = tagDir + item + '/';

        return {
          name: item,
          path: tagPath,
          permalink: siteUrl + tagPath
        }
      });
    } else if (tags){
      var postTag = tags.toString(),
        tagPath = tagDir + postTag + '/';

      meta.tags = [{name: postTag, path: tagPath, permalink: siteUrl + tagPath}];
    }

    if (category){
      meta.categories = _.map(category, function(item, i){
        var catPath = category.slice(0, i + 1).join('/') + '/';

        return {
          name: item,
          path: catPath,
          permalink: siteUrl + catPath
        }
      });
    } else {
      delete meta.categories;
    }

    var date = meta.date;

    if (meta.permalink){
      var link = meta.permalink;
      if (!path.extname(link) && link.substr(link.length - 1, 1) !== '/') meta.path = link + '/';
    } else {
      if (configLink){
        var path = configLink
          .replace(':category', category.length ? category.join('/') : catDir)
          .replace(':year', date.format('YYYY'))
          .replace(':month', date.format('MM'))
          .replace(':day', date.format('DD'))
          .replace(':title', filename);
      } else {
        var path = date.format('YYYY/MM/DD') + '/';
      }
    }

    meta.permalink = siteUrl + path;
    meta.path = path;
    callback(meta);
  });
};

var loadPage = function(source, callback){
  var extname = pathFn.extname(source);

  load(source, function(meta){
    if (meta.permalink){
      var path = meta.permalink;

      if (!pathFn.extname(link)){
        if (link.substr(path.length - 1, 1) === '/') path += 'index.html'
        else path += '/index.html';
      }
    } else {
      var path = source.substring(0, source.length - extname.length) + '.html';
    }

    meta.permalink = siteUrl + path;
    meta.path = path;
    callback(meta);
  });
};

extend.processor.register(function(locals, callback){
  console.log('Loading source files.');

  file.dir(sourceDir, function(files){
    async.forEach(files, function(item, next){
      var extname = pathFn.extname(item).substring(1),
        dirs = item.split(sep);

      if (dirs[0] === '_posts'){
        dirs.shift();

        for (var i=0, len=dirs.length; i<len; i++){
          var front = dirs[i].substr(0, 1);
          if (front === '.' || front === '_') return next();
        }

        if (renderer.indexOf(extname) === -1){
          next();
        } else {
          loadPost(item, dirs.slice(0, dirs.length - 1), function(post){
            locals.posts.push(post);
            next();
          });
        }
      } else {
        for (var i=0, len=dirs.length; i<len; i++){
          var front = dirs[i].substr(0, 1);
          if (front === '.' || front === '_') return next();
        }

        if (renderer.indexOf(extname) === -1){
          file.copy(sourceDir + item, publicDir + item, next);
        } else {
          loadPage(item, function(page){
            locals.pages.push(page);
            next();
          });
        }
      }
    }, callback);
  });
});