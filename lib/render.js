var render = require('./extend').renderer.list(),
  renderSync = require('./extend').rendererSync.list(),
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

  if (render.hasOwnProperty(ext)){
    var newCallback = output(render[ext].output, callback);
    
    if (locals){
      render[ext](null, source, locals, output(render[ext].output, newCallback));
    } else {
      render[ext](null, source, output(render[ext].output, newCallback));
    }
  } else {
    callback(null, source);
  }
};

exports.renderSync = function(source, ext, locals){
  if (renderSync.hasOwnProperty(ext)){
    if (locals){
      return renderSync[ext](null, source, locals);
    } else {
      return renderSync[ext](null, source);
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
      if (render.hasOwnProperty(ext)){
        var newCallback = output(render[ext].output, callback);

        if (locals){
          render[ext](source, result, locals, newCallback);
        } else {
          render[ext](source, result, newCallback);
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

  if (renderSync.hasOwnProperty(ext)){
    if (locals){
      return renderSync[ext](null, content, locals);
    } else {
      return renderSync[ext](null, content);
    }
  } else {
    return content;
  }
};