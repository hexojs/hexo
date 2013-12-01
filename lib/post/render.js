var async = require('async'),
  swig = require('swig'),
  _ = require('lodash'),
  isReady = false;

var rEscapeContent = /<escape( indent=['"](\d+)['"])?>([\s\S]+?)<\/escape>/g,
  rLineBreak = /(\n(\t+)){2,}/g,
  rUnescape = /<notextile>(\d+)<\/notextile>/g;

/**
* Renders post contents.
*
* Rendering flow:
*
* - Compiles with Swig
* - Runs pre-filter
* - Compiles with Markdown (or other render engines, depends on the extension name of source files)
* - Runs post-filter
*
* @method render
* @param {String} source The path of source file
* @param {Object} data
* @param {Function} callback
* @for Hexo.post
*/

module.exports = function(source, data, callback){
  var extend = hexo.extend,
    filter = extend.filter.list(),
    render = hexo.render.render;

  // Loads tag plugins
  if (!isReady){
    swig.init({tags: extend.tag.list()});
    isReady = true;
  }

  // Replaces <escape>content</escape> in raw content with `<notextile>cache number</notextile>`,
  // and adds indent before the content to avoid markdown render error.
  var escapeContent = function(){
    var indent = arguments[2],
      str = arguments[3],
      out = '<notextile>' + cache.length + '</notextile>\n';

    cache.push(str);

    // Adds indents after the content
    if (indent){
      for (var i = 0; i < indent; i++){
        out += '\t';
      }
    }

    return out;
  };

  var cache = [];

  async.series([
    // Renders content with Swig
    function(next){
      try {
        data.content = swig.compile(data.content)();
      } catch (err){
        return callback(err);
      }

      // Replaces contents in `<notextile>` tag and saves them in cache
      data.content = data.content.replace(rEscapeContent, escapeContent);

      next();
    },
    function(next){
      // Pre filters
      async.eachSeries(filter.pre, function(filter, next){
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
      // Deletes continous line breaks
      data.content = data.content.replace(rLineBreak, function(){
        var tabs = arguments[2],
          out = '\n';

        for (var i = 0, len = tabs.length; i < len; i++){
          out += '\t';
        }

        return out;
      });

      var options = _.extend({}, hexo.config.markdown, data.markdown);

      // Renders with Markdown or other render engines.
      render({text: data.content, path: source}, options, function(err, result){
        if (err) return callback(err);

        // Replaces cache data with real contents.
        data.content = result.replace(rUnescape, function(match, number){
          return cache[number];
        });

        // Post filters
        async.eachSeries(filter.post, function(filter, next){
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