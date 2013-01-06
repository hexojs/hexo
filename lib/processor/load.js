var extend = require('../extend'),
  renderer = Object.keys(extend.renderer.list()),
  tag = extend.tag.list(),
  render = require('../render'),
  route = require('../route'),
  Collection = require('../model').Collection,
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
  configLink = config.permalink,
  highlightConfig = config.highlight,
  highlightEnable = highlightConfig ? highlightConfig.enable : true,
  backtickConfig = highlightConfig ? highlightConfig.backtick_code_block : true,
  lineNumConfig = highlightConfig ? highlightConfig.line_number : true;

swig.init({tags: tag});

if (config.new_post_name){
  var configNewPostLink = config.new_post_name;

  var filenameRE = pathFn.basename(configNewPostLink, pathFn.extname(configNewPostLink))
    .replace(':year', '\\d{4}')
    .replace(/:(month|day)/g, '\\d{2}')
    .replace(':title', '(.*)');

  filenameRE = new RegExp(filenameRE);
}

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

    // Use Swig to compile
    var compiled = swig.compile(meta._content)();

    // Backtick code block
    if (highlightEnable && backtickConfig){
      compiled.replace(/`{3,} *([^\n]*)?\n([\s\S]+?)\n`{3,}/g, function(match, args, str){
        var options = {gutter: lineNumConfig};

        if (!args) return '<notextile>' + highlight(str, options) + '</notextile>';

        var matched = args.match(/([^\s]+)\s+(.+?)(https?:\/\/\S+)\s*(.+)?/i);

        if (matched){
          var lang = matched[1],
            caption = '<span>' + matched[2] + '</span>';

          if (matched[3]){
            caption += '<a href="' + matched[3] + '">' + (matched[4] ? matched[4] : 'link') + '</a>';
          }

          options.lang = lang;
          options.caption = caption;
          return '<notextile>' + highlight(str, options) + '</notextile>';
        } else {
          options.lang = args;
          return '<notextile>' + highlight(str, options) + '</notextile>';
        }
      });
    }

    var cache = [],
      length = 0;

    // Replace contents in <notextile> tag and save them in cache
    compiled = compiled.replace(/<notextile>(.*?)<\/notextile>/g, function(match, str){
      cache.push(str);
      return '<notextile>!' + length++ + '</notextile>';
    });

    var mdOptions = {
      highlight: function(code, lang){
        if (highlightEnable) return highlight(code, {lang: lang, gutter: false});
      }
    };

    // Use Markdown to compile
    render.render(compiled, extname, mdOptions, function(err, result){
      if (err) throw err;
      delete meta._content;
      // Use cache to replace contents
      meta.content = result.replace(/<notextile>(.*?)<\/notextile>/g, function(match, str){
        var num = str.substring(1);
        return cache[num];
      });
      callback(meta);
    });
  });
};

var loadPost = function(source, category, callback){
  var extname = pathFn.extname(source),
    filename = pathFn.basename(source, extname);

  if (filenameRE){
    filename = filename.match(filenameRE) ? filename.match(filenameRE)[1] : filename;
  }

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

    if (category.length){
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
  var posts = [],
    pages = [];

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
            posts.push(post);
            next();
          });
        }
      } else {
        for (var i=0, len=dirs.length; i<len; i++){
          var front = dirs[i].substr(0, 1);
          if (front === '.' || front === '_') return next();
        }

        if (renderer.indexOf(extname) === -1){
          route.set(item, function(func){
            var rs = fs.createReadStream(sourceDir + item);
            rs.source = item;
            func(null, rs);
          });
          next();
        } else {
          loadPage(item, function(page){
            pages.push(page);
            next();
          });
        }
      }
    }, function(err){
      if (err) throw err;
      locals.posts = new Collection(posts).sort('date', -1);
      locals.pages = new Collection(pages).sort('date', -1);
      callback(null, locals);
    });
  });
});