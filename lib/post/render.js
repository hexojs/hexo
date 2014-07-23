var async = require('async'),
  swig = require('swig'),
  _ = require('lodash'),
  isReady = false;

var rEscapeContent = /<escape( indent=['"](\d+)['"])?>([\s\S]+?)<\/escape>/g,
  rUnescape = /<hexoescape>(\d+)<\/hexoescape>/g;

swig.setDefaults({autoescape: false});

/**
* Renders post contents.
*
* Rendering flow:
*
* - Compiles with Swig
* - Runs before_post_render filter
* - Compiles with Markdown (or other render engines, depends on the extension name of source files)
* - Runs after_post_render filter
*
* @method render
* @param {String} source The path of source file
* @param {Object} data
* @param {Function} callback
* @for post
* @static
*/

module.exports = function(source, data, callback){
  var extend = hexo.extend,
    filter = extend.filter,
    render = hexo.render.render;

  // Loads tag plugins
  if (!isReady){
    extend.tag.list().forEach(function(tag){
      swig.setTag(tag.name, tag.parse, tag.compile, tag.ends, true);
    });

    isReady = true;
  }

  // Replaces <escape>content</escape> in raw content with `<hexoescape>cache id</hexoescape>`
  var escapeContent = function(){
    var indent = parseInt(arguments[2], 10),
      str = arguments[3],
      out = '';

    out += '<hexoescape>' + cache.length + '</hexoescape>';
    cache.push(str);

    return out;
  };

  var cache = [];

  async.series([
    // Renders content with Swig
    function(next){
      try {
        data.content = swig.render(data.content, {
          locals: data,
          filename: source
        });
      } catch (err){
        return callback(err);
      }

      // Replaces contents in `<escape>` tag and saves them in cache
      data.content = data.content.replace(rEscapeContent, escapeContent);

      next();
    },
    function(next){
      // Pre filters
      async.eachSeries(filter.list('before_post_render'), function(filter, next){
        filter(data, function(err, result){
          if (err) return callback(err);

          if (result){
            // Replaces contents in `<escape>` tag and saves them in cache
            result.content = result.content.replace(rEscapeContent, escapeContent);

            data = result;
          }

          next();
        });
      }, next);
    },
    function(next){
      var options = data.markdown || {};

      if (!hexo.config.highlight.enable){
        options.highlight = null;
      }

      // Renders with Markdown or other render engines.
      render({text: data.content, path: source, engine: data.engine}, options, function(err, result){
        if (err) return callback(err);

        // Replaces cache data with real contents.
        data.content = result.replace(rUnescape, function(match, number){
          return cache[number];
        });

        // Clean cache
        cache.length = 0;

        // Post filters
        async.eachSeries(filter.list('after_post_render'), function(filter, next){
          filter(data, function(err, result){
            if (err) return callback(err);

            if (result){
              data = result;
            }

            next();
          });
        }, next);
      });
    }
  ], function(err){
    callback(err, data);
  });
};