var async = require('async'),
  pathFn = require('path'),
  _ = require('lodash'),
  swig = require('swig'),
  util = require('./util'),
  file = util.file2,
  yfm = util.yfm;

var extend = hexo.extend,
  renderer = extend.renderer.list(),
  rendererSync = extend.renderer.list(true),
  filter = extend.filter.list(),
  swigInit = false;

var rEscapeContent = /<escape( indent=['"](\d+)['"])?>([\s\S]+?)<\/escape>/g,
  rLineBreak = /(\n(\t+)){2,}/g,
  rUnescape = /<notextile>(\d+)<\/notextile>/g;

var getExtname = function(str){
  return pathFn.extname(str).substring(1);
};

exports.isRenderable = function(path){
  return renderer.hasOwnProperty(getExtname(path));
};

exports.isRenderableSync = function(path){
  return rendererSync.hasOwnProperty(getExtname(path));
};

exports.getOutput = function(path){
  var r = renderer[getExtname(path)];
  if (r) return r.output;
};

var render = exports.render = function(data, options, callback){
  if (!callback){
    if (typeof options === 'function'){
      callback = options;
      options = {};
    } else {
      callback = function(){};
    }
  }

  async.waterfall([
    function(next){
      if (data.text) return next(null, data.text);
      if (!data.path) return next(new Error('No input file or string'));

      file.readFile(data.path, next);
    },
    function(text, next){
      var ext = data.engine || getExtname(data.path);

      if (ext && renderer.hasOwnProperty(ext)){
        renderer[ext]({
          path: data.path,
          text: text
        }, options, next);
      } else {
        next(null, text);
      }
    }
  ], callback);
};

exports.renderSync = function(data, options){
  if (data.text){
    var text = data.text;
  } else if (data.path){
    var text = file.readFileSync(data.path);
    if (!text) return;
  } else {
    return;
  }

  var ext = data.engine || getExtname(data.path);

  if (ext && rendererSync.hasOwnProperty(ext)){
    return rendererSync[ext]({path: data.path, text: text}, options);
  } else {
    return text;
  }
};

exports.renderFile = function(source, options, callback){
  if (!callback){
    if (typeof options === 'function'){
      callback = options;
      options = {};
    }
  }

  var ext = getExtname(source);

  options.filename = source;

  async.waterfall([
    function(next){
      if (options.cache && cache.hasOwnProperty(source)){
        next(null, cache[source]);
      } else {
        file.readFile(source, function(err, content){
          if (err) return callback(err);

          var data = cache[source] = yfm(content);
          next(null, data);
        });
      }
    },
    function(data, next){
      var layout = data.hasOwnProperty('layout') ? data.layout : options.layout,
        content = data._content;

      delete data.layout;
      delete data._content;

      var locals = _.extend({}, options, helper, data);

      renderer[ext]({path: source, text: content}, locals, function(err, result){
        if (err) return callback(err);
        if (!layout) return callback(null, result);

        var layoutPath = path.dirname(source) + '/' + layout;
        if (!path.extname(layoutPath)) layoutPath += '.' + ext;

        fs.exists(layoutPath, function(exist){
          if (!exist) return callback(null, result);

          renderFile(layoutPath, _.extend({}, locals, {body: result, layout: false}), callback);
        });
      });
    }
  ]);
};

exports.renderPost = function(data, callback){
  if (!swigInit) swig.init({tags: extend.tag.list()});

  var cache = [];

  async.series([
    function(next){
      try {
        data.content = swig.compile(content)();
      } catch (err){
        return callback(err);
      }

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
            if (result.content !== data.content) result.content = result.content.replace(rEscapeContent, escapeContent);

            data = content;
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

      render({text: data.content, path: data.source}, function(err, result){
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