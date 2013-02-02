var fs = require('graceful-fs'),
  pathFn = require('path'),
  swig = require('swig'),
  moment = require('moment'),
  _ = require('underscore'),
  extend = require('../../extend'),
  renderer = Object.keys(extend.renderer.list()),
  tagExt = extend.tag.list(),
  render = require('../../render'),
  route = require('../../route'),
  model = require('../../model'),
  dbPosts = model.posts,
  dbPages = model.pages,
  dbCats = model.categories,
  dbTags = model.tags,
  dbAssets = model.assets,
  util = require('../../util'),
  yfm = util.yfm,
  titlecase = util.titlecase,
  highlight = util.highlight,
  config = hexo.config,
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
  categoryMap = config.category_map || {},
  tagMap = config.tag_map || {},
  excerptRegex = /<!--\s*more\s*-->/;

swig.init({tags: tagExt});

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

// Percent-encoding: http://en.wikipedia.org/wiki/Percent-encoding#Percent-encoding_reserved_characters
var escape = function(str){
  return str
    .replace(/\s/g, '-')
    .replace(/!/g, '%21')
    .replace(/#/g, '%23')
    .replace(/\$/g, '%24')
    .replace(/&/g, '%26')
    .replace(/'/, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29')
    .replace(/\*/g, '%2A')
    .replace(/\+/g, '%2B')
    .replace(/,/g, '%2C')
    .replace(/\//g, '%2F')
    .replace(/:/g, '%3A')
    .replace(/;/g, '%3B')
    .replace(/=/g, '%3D')
    .replace(/\?/g, '%3F')
    .replace(/@/g, '%40')
    .replace(/\[/g, '%5B')
    .replace(/\]/g, '%5D');
};

var load = function(source, content, callback){
  var extname = pathFn.extname(source).substring(1);

  fs.stat(source, function(err, stats){
    if (err) throw new Error('Failed to read file status: ' + source);

    var meta = yfm(content),
      mtime = stats.mtime;

    //meta.stats = stats;
    meta.source = source;

    if (meta.date){
      meta.date = _.isDate(meta.date) ? meta.date : moment(meta.date, 'YYYY-MM-DD HH:mm:ss').toDate();
    }

    if (meta.updated){
      meta.updated = _.isDate(meta.updated) ? meta.updated : moment(meta.updated, 'YYYY-MM-DD HH:mm:ss').toDate();
    } else {
      meta.updated = mtime;
    }

    // Read the last modified time from database
    var data = dbAssets.findOne({path: source});

    if (data){
      if (data.mtime.getTime() === mtime.getTime()){
        meta._latest = true;
      } else {
        meta._latest = false;
        dbAssets.update(data._id, {mtime: mtime});
      }
    } else {
      meta._latest = false;
      dbAssets.insert({path: source, mtime: mtime});
    }

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

extend.processor.register(/^_posts\/?([^_]*)\/([^_]+)\.(\w+)/, function(file, callback){
  var source = file.source,
    category = file.params[1],
    filename = file.params[2],
    extname = file.params[3];

  if (renderer.indexOf(extname) === -1) return callback();

  load(source, file.content, function(meta){
    dbPosts.insert(_.omit(meta, 'tags', 'categories'), function(post){
      var _id = post._id;

      if (filenameRE){
        var info = getInfoFromFilename(filename);
        filename = info.title;
        if (!meta.date){
          meta.date = new Date(info.year, info.month - 1, info.day);
        }
      }

      if (meta.tags){
        if (!_.isArray(meta.tags)) meta.tags = [meta.tags];
        var tags = [];

        meta.tags.forEach(function(tag){
          var data = dbTags.findOne({name: tag});
          if (data){
            dbTags.update(data._id, {posts: {$push: _id}});
            tags.push(data._id);
          } else {
            dbTags.insert({name: tag, path: tagDir + escape(tag) + '/', posts: [_id]}, function(tag){
              tags.push(tag._id);
            });
          }
        });

        meta.tags = tags;
      }

      if (meta.categories){
        if (!_.isArray(meta.categories)) meta.categories = meta.categories.split('/');
        if (category) meta.categories = category.split('/').concat(meta.categories);
      } else if (category){
        meta.categories = category.split('/');
      }

      if (meta.categories){
        var catPath = _.map(meta.categories, function(item){
          return escape(item);
        }).join('/');

        var cats = [];

        meta.categories.forEach(function(cat){
          var data = dbCats.findOne({path: catPath});
          if (data){
            dbCats.update(data._id, {posts: {$push: _id}});
            cats.push(data._id);
          } else {
            dbCats.insert({name: cat, path: catPath + '/'}, function(cat){
              cats.push(cat._id);
            });
          }
        });

        meta.categories = cats;
      }

      var date = post.date;

      if (meta.permalink){
        var link = meta.permalink;
        if (!path.extname(link) && link.substr(link.length - 1, 1) !== '/') meta.path = link + '/';
        delete meta.permalink;
      } else {
        if (configLink){
          var path = configLink
            .replace(':category', catPath || defaultCategory)
            .replace(':year', date.format('YYYY'))
            .replace(':month', date.format('MM'))
            .replace(':day', date.format('DD'))
            .replace(':title', escape(filename));
        } else {
          var path = date.format('YYYY/MM/DD') + '/';
        }
      }

      meta.path = path;
      dbPosts.update(_id, meta);
      callback();
    });
  });
});

extend.processor.register(/^[^_]/, function(file, callback){
  var source = file.source,
    content = file.content,
    path = file.path,
    extname = pathFn.extname(path),
    split = path.split('/');

  for (var i=0, len=split.length; i<len; i++){
    var front = split[i].substring(0, 1);
    if (front === '_') return callback();
  }

  // Normal file
  if (renderer.indexOf(extname) === -1){
    // Get the file status
    fs.stat(source, function(err, stats){
      if (err) throw new Error('Failed to read file status: ' + source);

      // Read the last modified time of this file from database
      var data = dbAssets.findOne({path: source}),
        mtime = stats.mtime,
        skip = false;

      // Compare the modified time if the data exists
      if (data){
        // If both are same, skip this file
        if (data.mtime.getTime() === mtime.getTime()){
          skip = true;
        // Otherwise, update the data
        } else {
          dbAssets.update(data._id, {mtime: mtime});
        }
      } else {
        // Insert new data to the database if the data not exists
        dbAssets.insert({path: source, mtime: mtime});
      }

      hexo.cache.assets.push(path);

      // Start creating the file
      if (!skip || hexo.cache.rebuild){
        route.set(path, function(fn){
          fn(null, file.buffer);
        });
      }

      callback();
    });
  // Markdown
  } else {
    load(source, content, function(meta){
      if (meta.permalink){
        var path = meta.permalink;

        if (!pathFn.extname(path)){
          if (path.substr(path.length - 1, 1) === '/') path += 'index.html'
          else path += '/index.html';
        }

        delete meta.permalink;
      } else {
        var path = source.substring(0, source.length - extname.length) + '.html';
      }

      meta.path = path;
      dbPages.insert(meta);
      callback();
    });
  }
});