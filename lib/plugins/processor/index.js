var fs = require('graceful-fs'),
  pathFn = require('path'),
  swig = require('swig'),
  moment = require('moment'),
  _ = require('lodash'),
  async = require('async'),
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
  filenameCaps = config.filename_case,
  excerptRegex = /<!--\s*more\s*-->/;

var existed = {
  posts: [],
  pages: [],
  assets: []
};

swig.init({tags: tagExt});

if (newPostConfig){
  var filenameRE = pathFn.basename(newPostConfig, pathFn.extname(newPostConfig))
    .replace(/:year/g, '(\\d{4})')
    .replace(/:(month|day)/g, '(\\d{2})')
    .replace(/:title/g, '(.*)');

  filenameRE = new RegExp(filenameRE);
  var filenameArr = _.map(newPostConfig.match(/:[a-z]+/g), function(item){
    return item.substring(1);
  });
}

var getInfoFromFilename = function(str){
  if (!filenameRE.test(str)) return;

  var meta = str.match(filenameRE).slice(1),
    result = {};

  for (var i=0, len=filenameArr.length; i<len; i++){
    result[filenameArr[i]] = meta[i];
  }

  return result;
};

// Percent-encoding: http://en.wikipedia.org/wiki/Percent-encoding#Percent-encoding_reserved_characters
var escapeRule = {
  '\s': '-',
  '!': '%21',
  '#': '%23',
  '$': '%24',
  '&': '%26',
  "'": '%27',
  '(': '%28',
  ')': '%29',
  '*': '%2A',
  '+': '%2B',
  ',': '%2C',
  '/': '%2F',
  ':': '%3A',
  ';': '%3B',
  '=': '%3D',
  '?': '%3F',
  '@': '%40',
  '[': '%5B',
  ']': '%5D'
};

var escape = function(str){
  str = str.replace(/\s|!|#|\$|&|'|\(|\)|\*|\+|,|\/|:|;|\*|\?|@|\[|\]/g, function(match){
    return escapeRule[match];
  });

  if (filenameCaps == 1){
    str = str.toLowerCase();
  } else if (filenameCaps == 2){
    str = str.toUpperCase();
  }

  return str;
};

var load = function(file, stat, extname, callback){
  var source = file.source;

  file.read(function(err, content){
    if (err) throw new Error('File read error: ' + source);

    var meta = yfm(content);

    meta.source = source;
    meta.mtime = stat.mtime;
    meta.ctime = stat.ctime;
    if (!_.isDate(meta.date)) meta.date = moment(meta.date, 'YYYY-MM-DD HH:mm:ss').toDate();
    if (meta.updated){
      if (!_.isDate(meta.updated)) meta.updated = moment(meta.updated, 'YYYY-MM-DD HH:mm:ss').toDate();
    } else {
      meta.updated = stat.mtime;
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
    render.render({text: compiled, path: source}, mdOptions, function(err, result){
      if (err) throw new Error('Markdown render error: ' + source);

      delete meta._content;
      // Use cache to replace contents
      var content = result.replace(/<notextile>(.*?)<\/notextile>/g, function(match, str){
        var num = str.substring(1);
        return cache[num];
      });

      // paranoid-auto-spacing by gibuloto
      // https://github.com/gibuloto/paranoid-auto-spacing
      if (autoSpacingConfig){
        content = content
          .replace(/([\u4e00-\u9fa5\u3040-\u30FF])([a-z0-9@#&;=_\[\$\%\^\*\-\+\(\/])/ig, '$1 $2')
          .replace(/([a-z0-9#!~&;=_\]\,\.\:\?\$\%\^\*\-\+\)\/])([\u4e00-\u9fa5\u3040-\u30FF])/ig, '$1 $2');
      }

      if (titlecaseConfig){
        meta.title = titlecase(meta.title);
      }

      if (excerptRegex.test(content)){
        meta.content = content.replace(excerptRegex, function(match, index){
          meta.excerpt = index;
          return '<a name="more"></a>';
        });
      } else {
        meta.content = content;
        meta.excerpt = content.length;
      }

      callback(null, meta);
    });
  });
};

extend.processor.register(/^_posts\/([^_](?:(?!\/_).)*)$/, function(file, callback){
  var source = file.source,
    match = file.params[1].match(/((.*)\/)?(.*)\.(\w+)/),
    category = match[2],
    filename = match[3],
    extname = match[4],
    data = dbPosts.findOne({source: source});

  // Delete the post from the database if deleted
  if (file.type === 'delete' && data){
    var _id = data._id;

    route.remove(data.path);
    dbPosts.remove(_id);
    dbCats.findRaw({posts: {$in: _id}}).update({posts: {$pull: _id}});
    dbTags.findRaw({posts: {$in: _id}}).update({posts: {$pull: _id}});
    return callback();
  }

  // Exit if the file can't be rendered
  if (renderer.indexOf(extname) === -1) return callback();

  async.auto({
    // Get file status
    stat: function(next){
      file.stat(next);
    },
    // Check whether the file was modified
    check: ['stat', function(next, results){
      var stat = results.stat;
      // If the file wasn't modified, exit the processor
      if (data && stat.mtime.getTime() === data.mtime.valueOf()){
        existed.posts.push(data._id);
        callback();
      } else {
        load(file, stat, extname, next);
      }
    }],
    // Insert a empty data to database
    id: function(next){
      if (data){
        next(null, data._id);
      } else {
        dbPosts.insert({}, function(data, id){
          next(null, id);
        });
      }
    }
  }, function(err, results){
    if (err) throw new Error('File parse error: ' + source);

    var meta = results.check,
      stat = results.stat,
      _id = results.id;

    if (!meta.date){
      if (filenameRE){
        var info = getInfoFromFilename(filename);
        if (info){
          filename = info.title;
          meta.date = new Date(info.year, info.month - 1, info.day);
        } else {
          meta.date = stat.ctime;
        }
      } else {
        meta.date = stat.ctime;
      }
    }

    if (meta.tags){
      if (!_.isArray(meta.tags)) meta.tags = [meta.tags];
      var tags = [];

      meta.tags.forEach(function(tag){
        var data = dbTags.findOne({name: tag});
        if (data){
          dbTags.update(data._id, {posts: {$addToSet: _id}});
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
          dbCats.update(data._id, {posts: {$addToSet: _id}});
          cats.push(data._id);
        } else {
          dbCats.insert({name: cat, path: catPath + '/', posts: [_id]}, function(cat){
            cats.push(cat._id);
          });
        }
      });

      meta.categories = cats;
    }

    var date = moment(meta.date);

    if (meta.permalink){
      var link = meta.permalink;
      if (!pathFn.extname(link) && link.substr(link.length - 1, 1) !== '/') meta.path = escape(link) + '/';
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
    existed.posts.push(_id);
    callback();
  });
});

extend.processor.register(/^[^_](?:(?!\/_).)*$/, function(file, callback){
  var source = file.source,
    path = file.path,
    extname = pathFn.extname(path),
    type = file.type;

  // Normal file
  if (renderer.indexOf(extname) === -1){
    var data = dbAssets.findOne({source: source});

    if (type === 'delete' && data){
      route.remove(path);
      dbAssets.remove(data._id);
      return callback();
    }

    file.stat(function(err, stat){
      if (err) throw new Error('File status read error: ' + source);

      var content = function(fn){
        fn(null, fs.createReadStream(source));
      };

      var mtime = stat.mtime;

      if (data){
        if (mtime.getTime() === data.mtime.getTime()){
          content.latest = true;
        } else {
          dbAssets.update(data._id, {mtime: mtime});
          existed.assets.push(data._id);
        }
      } else {
        dbAssets.insert({source: source, mtime: mtime}, function(data, id){
          existed.assets.push(id);
        });
      }

      route.set(path, content);
      callback();
    });
  // Markdown
  } else {
    var data = dbPages.findOne({source: source});

    if (type === 'delete' && data){
      route.remove(data.path);
      dbPages.remove(data._id);
      return callback();
    }

    async.auto({
      stat: function(next){
        file.stat(next);
      },
      check: ['stat', function(next, results){
        var stat = results.stat;
        if (data && stat.mtime.getTime() === data.mtime.valueOf()){
          existed.pages.push(data._id);
          callback();
        } else {
          load(file, stat, extname, next);
        }
      }],
      id: function(next){
        if (data){
          next(null, data._id);
        } else {
          dbPages.insert({}, function(data, id){
            next(null, id);
          });
        }
      }
    }, function(err, results){
      if (err) throw new Error('File parse error: ' + source);

      var meta = results.check,
        _id = results.id;

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

      dbPages.update(_id, meta);
      existed.pages.push(_id);
      callback();
    });
  }
});

hexo.on('processAfter', function(){
  dbPages.remove(_.difference(dbPages._index, existed.pages));
  dbAssets.remove(_.difference(dbAssets._index, existed.assets));

  dbPosts.each(function(item, id){
    if (existed.posts.indexOf(id) === -1){
      dbPosts.remove(id);
      dbCats.findRaw({posts: {$in: id}}).update({posts: {$pull: id}});
      dbTags.findRaw({posts: {$in: id}}).update({posts: {$pull: id}});
    }
  });

  existed = {
    posts: [],
    pages: [],
    assets: []
  };
});