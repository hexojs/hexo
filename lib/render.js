var renderer = require('./extend').renderer.list(),
  rendererSync = require('./extend').rendererSync.list(),
  helper = require('./extend').helper.list(),
  async = require('async'),
  path = require('path'),
  _ = require('lodash'),
  util = require('./util'),
  file = util.file,
  yfm = util.yfm,
  cache = {};

var render = exports.render = function(data, options, callback){
  if (_.isFunction(options)){
    callback = options;
    options = {};
  }

  var text = data.text,
    source = data.path;

  async.series([
    function(next){
      if (text){
        next(null);
      } else if (source){
        file.read(source, function(err, content){
          if (err) return callback(err);
          text = content;
          next();
        });
      } else {
        callback(new Error('No input file or string'));
      }
    },
    function(next){
      var ext = data.engine || path.extname(data.path).substring(1);

      if (ext && renderer.hasOwnProperty(ext)){
        renderer[ext]({path: source, text: text}, options, callback);
      } else {
        callback(null, text);
      }
    }
  ]);
};

var renderSync = exports.renderSync = function(data, options){
  if (data.text){
    var text = data.text;
  } else if (data.path){
    var text = file.readSync(data.path);
  } else {
    return;
  }

  var ext = data.engine || path.extname(data.path).substring(1);

  if (ext && rendererSync.hasOwnProperty(ext)){
    return rendererSync[ext]({path: data.path, text: text}, options);
  }
};

var renderFile = exports.__express = function(source, options, callback){
  if (_.isFunction(options)){
    callback = options;
    options = {};
  }

  var ext = path.extname(source).substring(1);

  async.waterfall([
    function(next){
      next(null, options.cache ? cache[source] : false);
    },
    function(data, next){
      if (data){
        next(null, data);
      } else {
        file.read(source, function(err, content){
          if (err) return callback(err);
          var data = cache[source] = yfm(content);
          next(null, data);
        });
      }
    },
    function(data, next){
      var layout = data.layout || options.layout,
        content = data._content;

      if (layout){
        var layoutPath = path.dirname(source) + '/' + layout;
        if (!path.extname(layoutPath)) layoutPath += '.' + ext;
        renderFile(layoutPath, _.extend(options, {body: content, layout: false}), function(err, result){
          if (err) return callback(err);
          next(null, result);
        });
      } else {
        next(null, content);
      }
    },
    function(content, next){
      var newHelper = _.clone(helper);

      for (var i in newHelper){
        newHelper[i] = newHelper[i](source, content, options);
      }

      var newLocals = _.extend(options, newHelper);

      renderer[ext]({path: source, text: content}, newLocals, callback);
    }
  ]);
};