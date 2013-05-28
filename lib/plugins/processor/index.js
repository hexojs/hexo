var fs = require('graceful-fs'),
  pathFn = require('path'),
  swig = require('swig'),
  moment = require('moment'),
  _ = require('lodash'),
  async = require('async'),
  extend = require('../../extend'),
  tagExt = extend.tag.list(),
  renderFn = require('../../render'),
  render = renderFn.render,
  isRenderable = renderFn.isRenderable,
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
  highlightConfig = config.highlight,
  highlightEnable = highlightConfig.enable,
  backtickConfig = highlightConfig.backtick_code_block,
  lineNumConfig = highlightConfig.line_number,
  tabConfig = highlightConfig.tab_replace,
  autoSpacingConfig = config.auto_spacing,
  titlecaseConfig = config.titlecase,
  newPostConfig = config.new_post_name,
  categoryMap = config.category_map || {},
  tagMap = config.tag_map || {},
  filenameCaps = config.filename_case,
  excerptRegex = /<!--\s*more\s*-->/;

var existed = {
  posts: [],
  pages: []
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

// http://tools.ietf.org/html/rfc3986#section-2.2
// http://en.wikipedia.org/wiki/Filename#Reserved_characters_and_words
var escape = function(str){
  var str = str.toString()
    .replace(/\s/g, '-')
    .replace(/:|\/|\?|#|\[|\]|@|!|\$|&|'|\(|\)|\*|\+|,|;|=|\\|%|<|>|\./g, '');

  if (filenameCaps == 1){
    str = str.toLowerCase();
  } else if (filenameCaps == 2){
    str = str.toUpperCase();
  }

  return str;
};

var load = function(file, stat, extname, callback){
  var source = file.source,
    path = file.path;

  file.read(function(err, content){
    if (err) throw new Error('File read error: ' + source);

    var meta = yfm(content);

    meta.source = path;
    meta.mtime = stat.mtime;
    meta.ctime = stat.ctime;
    if (meta.date && !_.isDate(meta.date)) meta.date = moment(meta.date, 'YYYY-MM-DD HH:mm:ss').toDate();
    if (meta.updated){
      if (!_.isDate(meta.updated)) meta.updated = moment(meta.updated, 'YYYY-MM-DD HH:mm:ss').toDate();
    } else {
      meta.updated = stat.mtime;
    }

    async.waterfall([
      function(next){
        if (meta._content){
          next(null, swig.compile(meta._content)());
        } else {
          delete meta._content;
          meta.content = '';
          meta.excerpt = 0;
          callback(null, meta);
        }
      },
      function(compiled, next){
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
        compiled = compiled.replace(/<notextile>([\s\S]+?)<\/notextile>/g, function(match, str){
          cache.push(str);
          return '<notextile>' + length++ + '</notextile>';
        });

        var mdOptions = {
          highlight: function(code, lang){
            if (highlightEnable) return highlight(code, {lang: lang, gutter: false});
          }
        };

        // Use Markdown to render
        render({text: compiled, path: source}, mdOptions, function(err, result){
          if (err) throw new Error('Markdown render error: ' + source);

          delete meta._content;
          // Use cache to replace contents
          var content = result.replace(/<notextile>(.*?)<\/notextile>/g, function(match, str){
            return cache[str];
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
      }
    ]);
  });
};

extend.processor.register(/^_posts\/([^_](?:(?!\/_).)*)$/, function(file, callback){
  var source = file.source,
    path = file.path,
    match = file.params[1].match(/((.*)\/)?([^~]*)\.(\w+)/),
    category = match[2],
    filename = match[3],
    extname = match[4],
    data = dbPosts.findOne({source: path});

  // Ignore filename ended with "~"
  if (!filename){
    return callback();
  }

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
  if (!isRenderable(extname)) return callback();

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

    if (filenameRE){
      var info = getInfoFromFilename(filename);
      if (info){
        filename = info.title;
      }

      if (!meta.date){
        if (info && info.year && info.month && info.day){
          meta.date = new Date(info.year, info.month - 1, info.day);
        } else {
          meta.date = stat.ctime;
        }
      }
    }

    if (meta.tags){
      if (!Array.isArray(meta.tags)) meta.tags = [meta.tags];
      var tags = [];

      meta.tags.forEach(function(tag){
        tag = tag.toString();

        var data = dbTags.findOne({name: tag});
        if (data){
          dbTags.update(data._id, {posts: {$addToSet: _id}});
          tags.push(data._id);
        } else {
          dbTags.insert({name: tag, slug: escape(tagMap[tag] || tag), posts: [_id]}, function(tag){
            tags.push(tag._id);
          });
        }
      });

      meta.tags = tags;
    } else {
      meta.tags = [];
    }

    if (meta.categories){
      if (!Array.isArray(meta.categories)) meta.categories = meta.categories.split('/');
      if (category) meta.categories = category.split('/').concat(meta.categories);
    } else if (category){
      meta.categories = category.split('/');
    }

    if (meta.categories){
      var cats = [];

      _.each(meta.categories, function(item, i, arr){
        item = item.toString();

        var slug = _.map(arr.slice(0, i + 1), function(item){
          return escape(categoryMap[item] || item);
        }).join('/');

        var data = dbCats.findOne({slug: slug});
        if (data){
          dbCats.update(data._id, {posts: {$addToSet: _id}});
          cats.push(data._id);
        } else {
          dbCats.insert({name: item, slug: slug, posts: [_id]}, function(cat){
            cats.push(cat._id);
          });
        }
      });

      meta.categories = cats;
    } else {
      meta.categories = [];
    }

    if (meta.permalink){
      var link = meta.slug = escape(meta.permalink);
      if (!pathFn.extname(link) && link.substr(link.length - 1, 1) !== '/') link += '/';
      delete meta.permalink;
    } else {
      meta.slug = escape(filename);
    }

    dbPosts.update(_id, meta);
    existed.posts.push(_id);
    callback();
  });
});

extend.processor.register(/^[^_](?:(?!\/_).)*$/, function(file, callback){
  var source = file.source,
    path = file.path,
    extname = pathFn.extname(path).substring(1),
    type = file.type;

  if (isRenderable(extname)){
    var data = dbPages.findOne({source: path});

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

      if (!meta.date) meta.date = meta.ctime;

      if (meta.permalink){
        var link = meta.permalink;

        if (!pathFn.extname(link)){
          if (link.substr(link.length - 1, 1) === '/') link += 'index.html';
          else link += '/index.html';
        }
      } else {
        var link = path.substring(0, path.length - extname.length) + 'html';
      }

      meta.path = link;

      dbPages.update(_id, meta);
      existed.pages.push(_id);
      callback();
    });
  } else {
    var data = dbAssets.findOne({source: 'source/' + path});

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
        }
      } else {
        dbAssets.insert({source: 'source/' + path, mtime: mtime});
      }

      route.set(path, content);
      callback();
    });
  }
});

hexo.on('processAfter', function(){
  var deletedPages = _.difference(dbPages._index, existed.pages);
  if (deletedPages.length){
    dbPages.remove(deletedPages);
  }

  dbPosts.each(function(item, id){
    if (existed.posts.indexOf(id) === -1){
      dbPosts.remove(id);
      dbCats.findRaw({posts: {$in: id}}).update({posts: {$pull: id}});
      dbTags.findRaw({posts: {$in: id}}).update({posts: {$pull: id}});
    }
  });
});
