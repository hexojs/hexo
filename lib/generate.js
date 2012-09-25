var config = require('./config'),
  log = require('./log'),
  render = require('./render'),
  file = require('./file'),
  theme = require('./theme'),
  async = require('async'),
  clc = require('cli-color'),
  fs = require('graceful-fs'),
  ejs = require('ejs'),
  path = require('path'),
  rimraf = require('rimraf'),
  queryEngine = require('query-engine'),
  xml = require('jstoxml'),
  _ = require('underscore');

var site = config;
site.time = new Date();
site.posts = new Posts();
site.pages = new Posts();
site.categories = {};
site.tags = {};

function Posts(){
  var init = function(arr){
    var newObj = new Posts();

    if (arr){
      for (var i=0, len=arr.length; i<len; i++){
        newObj[i] = arr[i];
      }

      newObj.length = len;
    }

    return newObj;
  };

  this.length = 0;

  this.each = function(callback){
    for (var i=0, len=this.length; i<len; i++){
      var _callback = callback(this[i], i);

      if (typeof _callback !== 'undefined'){
        if (_callback){
          continue;
        } else {
          break;
        }
      }
    }
  };

  this.toArray = function(){
    var result = [];

    this.each(function(item){
      result.push(item);
    });

    return result;
  };

  this.slice = function(start, end){
    return init([].slice.apply(this.toArray(), arguments));
  };

  this.skip = function(num){
    return init(this.slice(num));
  };

  this.limit = function(num){
    return init(this.slice(0, num));
  };

  this.push = function(item){
    this[this.length] = item;
    this.length++;
  };

  this.sort = function(field, order){
    var arr = this.toArray().sort(function(a, b){
      return a[field] - b[field];
    });

    if (typeof order !== 'undefined' && (order === -1 || order.toLowerCase() === 'desc')){
      arr = arr.reverse();
    };

    return init(arr);
  };

  this.random = function(){
    var arr = this.toArray().sort(function(a, b){
      return Math.random() - 0.5 < 0;
    });

    return init(arr);
  };

  this.find = function(query){
    queryEngine.createCollection(this.toArray()).findAll(query);
  };
};

function Locals(){
  this.site = site;
  this.page = {};
  this.theme = theme.config;

  var paginator = this.paginator = new function(){
    return {
      init: function(base, num, total){
        paginator.per_page = config.per_page;
        paginator.total = total;
        paginator.current = num;
        paginator.current_url = num === 1 ? base : base + config.pagination_dir + '/' + num + '/';
        paginator.posts = {};

        if (num === 1){
          paginator.prev = '';
        } else if (num === 2){
          paginator.prev = base;
        } else {
          paginator.prev = base + config.pagination_dir + '/' + (num - 1);
        }

        if (num === total){
          paginator.next = '';
        } else {
          paginator.next = base + config.pagination_dir + '/' + (num + 1);
        }
      }
    }
  };
};

var genArchives = function(base, collection, layout, callback){
  var total = Math.ceil(collection.length / config.per_page),
    i = 1;

  async.whilst(
    function(){
      return i <= total;
    },
    function(next){
      var locals = new Locals();
      locals.paginator.init(base, i, total);
      locals.paginator.posts = collection.slice(config.per_page * (i - 1), config.per_page * i);

      var target = locals.paginator.current_url;

      file.write(__dirname + '/../public' + target + 'index.html', ejs.render(theme.layout[layout], locals), function(err){
        if (err) throw err;
        log.debug('%s generated.', clc.bold(target));
        i++;
        next(null);
      });
    },
    function(err){
      callback();
    }
  );
};

module.exports = function(){
  var start = new Date();

  async.series([
    // Delete previous generated file
    function(next){
      var publicDir = __dirname + '/../public';

      fs.exists(publicDir, function(exist){
        if (exist){
          rimraf(publicDir, function(err){
            if (err) throw err;
            log.info('Previous generated file deleted.');
            next(null);
          });
        } else {
          next(null);
        }
      });
    },
    // Read source file
    function(next){
      var source = __dirname + '/../source';

      file.dir(source, function(files){
        async.forEach(files, function(item, next){
          var extname = path.extname(item),
            filename = path.basename(item, extname),
            dirs = path.dirname(item).split(path.sep);

          switch (extname){
            case '.txt':
            case '.text':
            case '.md':
            case '.markdown':
            case '.mdown':
            case '.markdn':
            case '.mkd':
            case '.mkdn':
            case '.mdwn':
            case '.mdtxt':
            case '.mdtext':
            case '.mdml':
            case '.html':
              if (dirs[0] === '_stash'){
                next(null);
              } else if (dirs[0] === '_posts'){
                var category = dirs.slice(1).join(path.sep);
                render.read(source + '/' + item, 'post', category, function(locals){
                  site.posts.push(locals);
                  next(null);
                });
              } else {
                render.read(source + '/' + item, 'page', item, function(locals){
                  site.pages.push(locals);
                  next(null);
                });
              }

              break;

            default:
              if (item.substring(0, 1) === '_'){
                next(null);
              } else {
                file.copy(source + '/' + item, __dirname + '/../public/' + item);
                next(null);
              }
              
              break;
          }
        }, function(){
          log.info('Source file loaded.');
          next(null);
        });
      });
    },
    // Analyze categories & tags
    function(next){
      site.posts = site.posts.sort('date', -1);

      site.posts.each(function(item){
        if (item.hasOwnProperty('categories')){
          item.categories.forEach(function(cat){
            if (site.categories.hasOwnProperty(cat.name)){
              site.categories[cat.name].push(item);
            } else {
              var newCat = new Posts();
              newCat.permalink = cat.permalink;
              newCat.push(item);
              site.categories[cat.name] = newCat;
            }
          });
        }

        if (item.hasOwnProperty('tags')){
          item.tags.forEach(function(tag){
            if (site.tags.hasOwnProperty(tag.name)){
              site.tags[tag.name].push(item);
            } else {
              var newTag = new Posts();
              newTag.permalink = tag.permalink;
              newTag.push(item);
              site.tags[tag.name] = newTag;
            }
          });
        }
      });

      log.info('Source file analyzed.');
      next(null);
    },
    // Read layout
    function(next){
      theme.layout.init(next);
    },
  ], function(){
    async.parallel([
      // Install theme assets
      function(next){
        require('./theme').asset(next);
      },
      // Generate posts
      function(next){
        async.forEach(site.posts.toArray(), function(item, next){
          var locals = new Locals();
          locals.page = item;

          file.write(__dirname + '/../public' + item.permalink + '/index.html', render.render(locals), function(err){
            if (err) throw err;
            log.debug('%s generated.', clc.bold(item.permalink));
            next(null);
          });
        }, function(){
          log.info('%d %s generated.', site.posts.length, site.posts.length > 1 ? 'posts' : 'post');
          next(null);
        });
      },
      // Generate page
      function(next){
        async.forEach(site.pages.toArray(), function(item, next){
          var locals = new Locals();
          locals.page = item;

          file.write(__dirname + '/../public' + item.permalink, render.render(locals), function(err){
            if (err) throw err;
            log.debug('%s generated.', clc.bold(item.permalink));
            next(null);
          });
        }, function(){
          log.info('%d %s generated.', site.pages.length, site.pages.length > 1 ? 'pages' : 'page');
          next(null);
        });
      },
      // Generate category archive
      function(next){
        var keys = Object.keys(site.categories);
        
        async.forEach(keys, function(key, next){
          var value = site.categories[key],
            total = Math.ceil(value.length / config.per_page),
            i = 1;

          async.whilst(
            function(){
              return i <= total;
            },
            function(next){
              var locals = new Locals();
              locals.page.title = key;
              locals.paginator.init(value.permalink + '/', i, total);
              locals.paginator.posts = value.slice(config.per_page * (i - 1), config.per_page * i);

              var target = locals.paginator.current_url;

              file.write(__dirname + '/../public' + target + 'index.html', ejs.render(theme.layout.category, locals), function(err){
                if (err) throw err;
                log.debug('%s generated.', clc.bold(target));
                i++;
                next(null);
              });
            },
            function(err){
              if (err) throw err;
              next(null);
            }
          );
        }, function(){
          log.info('%d %s archives generated.', keys.length, keys.length > 1 ? 'categories' : 'category');
          next(null);
        });
      },
      // Generate tag archives
      function(next){
        var keys = Object.keys(site.tags);

        async.forEach(keys, function(key, next){
          var value = site.tags[key],
            total = Math.ceil(value.length / config.per_page),
            i = 1;

          async.whilst(
            function(){
              return i <= total;
            },
            function(next){
              var locals = new Locals();
              locals.page.title = key;
              locals.paginator.init(value.permalink + '/', i, total);
              locals.paginator.posts = value.slice(config.per_page * (i - 1), config.per_page * i);

              var target = locals.paginator.current_url;

              file.write(__dirname + '/../public' + target + 'index.html', ejs.render(theme.layout.tag, locals), function(err){
                if (err) throw err;
                log.debug('%s generated.', clc.bold(target));
                i++;
                next(null);
              });
            },
            function(err){
              if (err) throw err;
              next(null);
            }
          );
        }, function(){
          log.info('%d %s archives generated.', keys.length, keys.length > 1 ? 'tags' : 'tag');
          next(null);
        });
      },
      // Generate archives
      function(next){
        async.parallel([
          // All posts
          function(next){
            genArchives(config.root + config.archive_dir + '/', site.posts, 'archive', next);
          },
          // Yearly posts
          function(next){
            var newest = site.posts[0].date.getFullYear(),
              oldest = site.posts[site.posts.length - 1].date.getFullYear(),
              i = newest;

            async.whilst(
              function(){
                return i >= oldest;
              },
              function(next){
                var yearly = new Posts(),
                  monthly = [];

                for (var m=0; m<12; m++){
                  monthly[m] = new Posts();
                }

                site.posts.each(function(item){
                  var date = item.date;

                  if (date.getFullYear() === i){
                    yearly.push(item);

                    for (var m=0; m<12; m++){
                      if (date.getMonth() === m){
                        monthly[m].push(item);
                      }
                    }
                  }
                });

                if (yearly.length > 0){
                  async.parallel([
                    // Generate yearly posts
                    function(next){
                      genArchives(config.root + config.archive_dir + '/' + i + '/', yearly, 'archive', next);
                    },
                    // Generate monthly posts
                    function(next){
                      
                      var m = 1;

                      async.forEach(monthly, function(item, next){
                        if (item.length > 0){
                          genArchives(config.root + config.archive_dir + '/' + i + '/' + (m < 10 ? '0' + m : m) + '/', item, 'archive', next);
                        } else {
                          next(null);
                        }

                        m++;
                      }, next);
                      next(null);
                    }
                  ], next);
                } else {
                  next(null);
                }

                i--;
              },
              function(){
                next(null);
              }
            );
          }
        ], function(){
          log.info('Archives generated.');
          next(null);
        });
      },
      // Generate index
      function(next){
        genArchives(config.root, site.posts, 'index', function(){
          log.info('Index generated.');
          next(null);
        });
      },
      // Generate feed
      function(next){
        var locals = {
          site: site,
          theme: theme.config
        };

        file.write(__dirname + '/../public/atom.xml', ejs.render(theme.layout.atom, locals), function(err){
          if (err) throw err;
          log.info('Feed generated.');
          next(null);
        });
      },
      // Generate sitemap
      function(next){
        var content = [];

        [].concat(site.posts.toArray(), site.pages.toArray()).forEach(function(item){
          content.push({
            url: {
              loc: config.url + item.permalink,
              lastmod: item.date.toISOString()
            }
          });
        });

        var result = xml.toXML({
          _name: 'urlset',
          _attrs: {
            xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9'
          },
          _content: content
        }, {header: true, indent: '  '});

        file.write(__dirname + '/../public/sitemap.xml', result, function(err){
          if (err) throw err;
          log.info('Sitemap generated.');
          next(null);
        });
      }
    ],
    function(){
      var finish = new Date();
      log.info('Site generated successfully in %d ms.', finish.getTime() - start.getTime());
    });
  });
};