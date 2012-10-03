var renderer = require('./extend').renderer.list(),
  rendererSync = require('./extend').rendererSync.list(),
  file = require('./util').file,
  fs = require('fs'),
  async = require('async'),
  path = require('path'),
  _ = require('underscore');

var output = function(exp, callback){
  return function(){
    var args = _.toArray(arguments);
    args.push(exp);
    callback.apply(null, args);
  }
};

exports.render = function(source, ext, locals, callback){
  if (_.isFunction(locals)){
    callback = locals;
    locals = null;
  }

  if (renderer.hasOwnProperty(ext)){
    var newCallback = output(renderer[ext].output, callback);
    
    if (locals){
      renderer[ext](null, source, locals, output(renderer[ext].output, newCallback));
    } else {
      renderer[ext](null, source, output(renderer[ext].output, newCallback));
    }
  } else {
    callback(null, source);
  }
};

exports.renderSync = function(source, ext, locals){
  if (rendererSync.hasOwnProperty(ext)){
    if (locals){
      return rendererSync[ext](null, source, locals);
    } else {
      return rendererSync[ext](null, source);
    }
  } else {
    return source;
  }
};

exports.compile = function(){
  var args = _.toArray(arguments),
    source = args.shift(),
    callback = args.pop(),
    extname = path.extname(source).substring(1);

  switch (args.length){
    case 2:
      var locals = args[1],
        ext = args[0];
      break;

    case 1:
      if (_.isObject(args[0])){
        var locals = args[0],
          ext = extname;
      } else {
        var ext = args[0];
      }
      break;

    default:
      var ext = extname;
      break;
  }

  file.read(source, function(err, result){
    if (err) throw err;

    if (result){
      if (renderer.hasOwnProperty(ext)){
        var newCallback = output(renderer[ext].output, callback);

        if (locals){
          renderer[ext](source, result, locals, newCallback);
        } else {
          renderer[ext](source, result, newCallback);
        }
      } else {
        callback(null, result);
      }
    } else {
      callback(null);
    }
  });
};

exports.compileSync = function(){
  var args = _.toArray(arguments),
    source = args.shift(),
    extname = path.extname(source);

  switch (args.length){
    case 2:
      var locals = args[1],
        ext = args[0];
      break;

    case 1:
      if (_.isObject(args[0])){
        var locals = args[0],
          ext = extname;
      } else {
        var ext = args[0];
      }
      break;

    default:
      var ext = extname;
      break;
  }

  var content = fs.readFileSync(source, 'utf8');

  if (rendererSync.hasOwnProperty(ext)){
    if (locals){
      return rendererSync[ext](null, content, locals);
    } else {
      return rendererSync[ext](null, content);
    }
  } else {
    return content;
  }
};