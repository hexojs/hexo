var extend = require('../extend'),
  renderer = Object.keys(extend.renderer.list()),
  tag = extend.tag.list(),
  render = require('../render'),
  renderFn = render.render,
  compileFn = render.compile,
  route = require('../route'),
  util = require('../util'),
  yfm = util.yfm,
  highlight = util.highlight,
  titlecase = util.titlecase,
  fs = require('fs'),
  pathFn = require('path'),
  sep = pathFn.sep,
  fs = require('graceful-fs'),
  swig = require('swig'),
  async = require('async'),
  moment = require('moment'),
  _ = require('underscore'),
  config = hexo.config,
  catDir = hexo.category_dir,
  tagDir = config.tag_dir + '/',
  siteUrl = config.url + '/',
  configLink = config.permalink,
  highlightConfig = config.highlight,
  highlightEnable = highlightConfig ? highlightConfig.enable : true,
  backtickConfig = highlightConfig ? highlightConfig.backtick_code_block : true,
  lineNumConfig = highlightConfig ? highlightConfig.line_number : true,
  autoSpacingConfig = config.auto_spacing ? true : false,
  titlecaseConfig = config.titlecase ? true : false,
  excerptRE = /<!--\s*more\s*-->/;

swig.init({tags: tag});

if (config.new_post_name){
  var configNewPostLink = config.new_post_name;

  var filenameRE = pathFn.basename(configNewPostLink, pathFn.extname(configNewPostLink))
    .replace(':year', '\\d{4}')
    .replace(/:(month|day)/g, '\\d{2}')
    .replace(':title', '(.*)');

  filenameRE = new RegExp(filenameRE);
}

var load = function(item, callback){
  var source = item.source;

  fs.stat(source, function(err, stats){
    if (err) throw err;

    var meta = yfm(item.content),
      extname = pathFn.extname(source).substring(1);

    meta.date = _.isDate(meta.date) ? moment(meta.date) : moment(meta.date, 'YYYY-MM-DD HH:mm:ss');
    meta.stats = stats;
    meta.source = item.source;

    if (meta.updated) meta.updated = _.isDate(meta.updated) ? moment(meta.updated) : moment(meta.updated, 'YYYY-MM-DD HH:mm:ss');
    else meta.updated = moment(stats.mtime);

    // Compile with Swig
    var compiled = swig.compile(meta._content)();

    // Backtick code block
    if (highlightEnable && backtickConfig){
      compiled = compiled.replace(/`{3,} *([^\n]*)?\n([\s\S]+?)\n`{3,}/g, function(match, args, str){
        var options = {gutter: lineNumConfig};

        if (!args) return '<notextile><pre><code>' + highlight(str, options) + '</code></pre></notextile>';

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

        return '<notextile><pre><code>' + highlight(str, options) + '</code></pre></notextile>';
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

    // Render with Markdown
    renderFn(compiled, extname, mdOptions, function(err, result){
      if (err) throw err;
      delete meta._content;

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

      if (content.match(excerptRE)){
        meta.content = content.replace(excerptRE, '<span id="more"></span>');
        meta.excerpt = content.split(excerptRE)[0];
      } else {
        meta.content = content;
      }

      callback(meta);
    });
  });
};

extend.processor.register(/^_posts\/(.*)\./, function(item, callback){
  var filename = item.params[1],
    category = item.source.match(/\/_posts\/(.*)\//);

  if (filenameRE){
    filename = filename.match(filenameRE) ? filename.match(filenameRE)[1] : filename;
  }

  load(item, function(meta){
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
      meta.categories = _.map(category[1].split(sep), function(item, i){
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
      if (!pathFn.extname(link) && link.substr(link.length - 1, 1) !== '/') meta.path = link + '/';
    } else {
      if (configLink){
        var path = configLink
          .replace(':category', category ? category[1] : catDir)
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
    hexo.site.posts.push(meta);
    callback();
  });
});

extend.processor.register(function(item, callback){
  var source = item.source,
    path = item.path,
    dirs = source.split(sep),
    extname = pathFn.extname(source).substring(1);

  for (var i=0, len=dirs.length; i<len; i++){
    var front = dirs[i].substr(0, 1);
    if (front === '_') return callback();
  }

  if (renderer.indexOf(extname) === -1){
    route.set(path, function(func){
      var rs = fs.createReadStream(source);
      rs.source = path;
      func(null, rs);
    });
    callback();
  } else {
    load(item, function(meta){
      if (meta.permalink){
        var link = meta.permalink;

        if (!pathFn.extname(link)){
          link += (link.substr(link.length - 1, 1) === '/' ? '' : '/') + 'index.html';
        }
      } else {
        var link = source.substring(0, source.length - extname.length) + '.html';
      }

      meta.permalink = siteUrl + link;
      meta.path = link;
      hexo.site.pages.push(meta);
      callback();
    });
  }
});