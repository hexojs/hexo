var extend = require('../extend'),
  renderer = Object.keys(extend.renderer.list()),
  tag = extend.tag.list(),
  render = require('../render'),
  route = require('../route'),
  Collection = require('../model').Collection,
  util = require('../util'),
  file = util.file,
  yfm = util.yfm,
  titlecase = util.titlecase,
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
  catDir = (config.category_dir || 'categories') + '/',
  tagDir = (config.tag_dir || 'tags') + '/',
  siteUrl = config.url + '/',
  configLink = config.permalink,
  highlightConfig = config.highlight,
  highlightEnable = highlightConfig ? highlightConfig.enable : true,
  backtickConfig = highlightConfig ? highlightConfig.backtick_code_block : true,
  lineNumConfig = highlightConfig ? highlightConfig.line_number : true,
  tabConfig = highlightConfig ? highlightConfig.tab_replace : '',
  autoSpacingConfig = config.auto_spacing,
  titlecaseConfig = config.titlecase,
  newPostConfig = config.new_post_name,
  defaultCategory = config.default_category || 'uncategorized',
  excerptRegex = /<!--\s*more\s*-->/;

swig.init({tags: tag});

if (newPostConfig){
  var filenameRE = pathFn.basename(newPostConfig, pathFn.extname(newPostConfig))
    .replace(':year', '(\\d{4})')
    .replace(/:(month|day)/g, '(\\d{2})')
    .replace(':title', '(.*)');

  filenameRE = new RegExp(filenameRE);
  var filenameArr = newPostConfig.match(/:[a-z]+/g);
}

var getInfoFromFilename = function(str){
  var meta = str.match(filenameRE);

  if (!meta) return;

  var result = {};

  _.each(filenameArr, function(item, i){
    item = item.substring(1);
    result[item] = meta[i + 1];
  });

  return result;
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

    meta.stats = stats;
    meta.source = sourcePath;

    if (meta.date){
      meta.date = _.isDate(meta.date) ? moment(meta.date) : moment(meta.date, 'YYYY-MM-DD HH:mm:ss');
    }

    if (meta.updated){
      meta.updated = _.isDate(meta.updated) ? moment(meta.updated) : moment(meta.updated, 'YYYY-MM-DD HH:mm:ss');
    } else {
      meta.updated = moment(stats.mtime);
    }

    if (!meta.comments) meta.comments = true;

    // Use Swig to compile
    var compiled = swig.compile(meta._content)();

    // Backtick code block
    if (highlightEnable && backtickConfig){
      compiled = compiled.replace(/`{3,} *([^\n]*)?\n([\s\S]+?)\n`{3,}/g, function(match, args, str){
        var options = {gutter: lineNumConfig, tab: tabConfig};

        str = str
          .replace(/</g, '\&lt;')
          .replace(/>/g, '\&gt;');

        if (args){
          var matched = args.match(/([^\s]+)\s+(.+?)(https?:\/\/\S+)\s*(.+)?/i);

          if (matched){
            var lang = matched[1],
              caption = '<span>' + matched[2] + '</span>';

            if (matched[3]){
              caption += '<a href="' + matched[3] + '">' + (matched[4] ? matched[4] : 'link') + '</a>';
            }

            options.lang = lang;
            options.caption = caption;
          } else {
            options.lang = args;
          }
        }

        if (lineNumConfig){
          return '<notextile>' + highlight(str, options).replace(/&amp;/g, '&') + '</notextile>';
        } else {
          return '<notextile><pre><code>' + highlight(str, options).replace(/&amp;/g, '&') + '</code></pre></notextile>';
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

    // Use Markdown to render
    render.render(compiled, extname, mdOptions, function(err, result){
      if (err) throw err;
      delete meta._content;
      // Use cache to replace contents
      var content = result.replace(/<notextile>(.*?)<\/notextile>/g, function(match, str){
        var num = str.substring(1);
        return cache[num];
      });

      /*
      paranoid-auto-spacing by gibuloto
      https://github.com/gibuloto/paranoid-auto-spacing

      英文、數字、符號 ([a-z0-9~!@#&;=_\$\%\^\*\-\+\,\.\/(\\)\?\:\'\"\[\]\(\)])
      中文 ([\u4E00-\u9FFF])
      日文 ([\u3040-\u30FF])
      */
      if (autoSpacingConfig){
        content = content
          .replace(/([\u4e00-\u9fa5\u3040-\u30FF])([a-z0-9@#&;=_\[\$\%\^\*\-\+\(\/])/ig, '$1 $2')
          .replace(/([a-z0-9#!~&;=_\]\,\.\:\?\$\%\^\*\-\+\)\/])([\u4e00-\u9fa5\u3040-\u30FF])/ig, '$1 $2');
      }

      if (titlecaseConfig){
        meta.title = titlecase(meta.title);
      }

      if (content.match(excerptRegex)){
        meta.content = content.replace(excerptRegex, '<span id="more"></span>');
        meta.excerpt = content.split(excerptRegex)[0];
      } else {
        meta.content = content;
      }

      callback(meta);
    });
  });
};

var loadPost = function(source, category, callback){
  var extname = pathFn.extname(source),
    filename = pathFn.basename(source, extname);

  load(source, function(meta){
    if (!meta.layout) meta.layout = 'post';

    if (filenameRE){
      var info = getInfoFromFilename(filename);
      filename = info.title;
      if (!meta.date){
        meta.date = moment(info.year + '-' + info.month + '-' + info.day, 'YYYY-MM-DD');
      }
    }

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

    if (meta.categories){
      if (_.isArray(meta.categories)){
        category = category.concat(meta.categories);
      } else {
        category = category.concat(meta.categories.split('/'));
      }
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
          .replace(':category', catDir + (category.length ? category.join('/') : defaultCategory))
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
    if (!meta.layout) meta.layout = 'page';

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