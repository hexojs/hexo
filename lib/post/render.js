var async = require('async'),
  swig = require('swig');

var extend = hexo.extend,
  filter = extend.filter.list(),
  renderFn = hexo.render,
  render = renderFn.render,
  swigInit = false;

var rEscapeContent = /<escape( indent=['"](\d+)['"])?>([\s\S]+?)<\/escape>/g,
  rLineBreak = /(\n(\t+)){2,}/g,
  rUnescape = /<notextile>(\d+)<\/notextile>/g;

module.exports = function(source, data, callback){
  if (!swigInit) swig.init({tags: extend.tag.list()});

  var escapeContent = function(){
    var indent = arguments[2],
      str = arguments[3],
      out = '<notextile>' + cache.length + '</notextile>\n';

    cache.push(str);

    // Add indents after the content
    if (indent){
      for (var i = 0; i < indent; i++){
        out += '\t';
      }
    }

    return out;
  };

  var cache = [];

  async.series([
    function(next){
      try {
        data.content = swig.compile(data.content)();
      } catch (err){
        return callback(err);
      }

      // Replaces contents in <notextile> tag and saves them in cache
      data.content = data.content.replace(rEscapeContent, escapeContent);

      next();
    },
    function(next){
      // Pre filters
      async.forEachSeries(filter.pre, function(filter, next){
        filter(data, function(err, result){
          if (err) return callback(err);

          if (result){
            result.content = result.content.replace(rEscapeContent, escapeContent);

            data = result;
          }

          next();
        });
      }, next);
    },
    function(next){
      // Delete continous line breaks
      data.content = data.content.replace(rLineBreak, function(){
        var tabs = arguments[2],
          out = '\n';

        for (var i = 0, len = tabs.length; i < len; i++){
          out += '\t';
        }

        return out;
      });

      render({text: data.content, path: source}, function(err, result){
        if (err) return callback(err);

        data.content = result.replace(rUnescape, function(match, number){
          return cache[number];
        });

        // Post filters
        async.forEachSeries(filter.post, function(filter, next){
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