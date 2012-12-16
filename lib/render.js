var render = require('./extend').renderer.list(),
  renderSync = require('./extend').rendererSync.list(),
  fs = require('fs'),
  async = require('async'),
  path = require('path'),
  _ = require('underscore'),
  util = require('./util'),
  file = util.file;

exports.render = function(source, ext, locals, callback){
  if (_.isFunction(locals)){
    callback = locals;
    locals = null;
  }

  if (render.hasOwnProperty(ext)){
    if (locals){
      render[ext](null, source, locals, function(err, output){
        callback(err, output, render[ext].output);
      });
    } else {
      render[ext](null, source, function(err, output){
        callback(err, output, render[ext].output);
      })
    }
  } else {
    callback(null, source, ext);
  }
};

exports.renderSync = function(source, ext, locals){
  if (renderSync.hasOwnProperty(ext)){
    return renderSync[ext](null, source, locals);
  } else {
    return source;
  }
};

exports.compile = function(source, locals, callback){
  if (_.isFunction(locals)){
    callback = locals;
    locals = null;
  }

  var ext = path.extname(source).substring(1);

  file.read(source, function(err, content){
    if (render.hasOwnProperty(ext)){
      if (locals){
        render[ext](source, content, locals, function(err, output){
          callback(err, output, render[ext].output);
        });
      } else {
        render[ext](source, content, function(err, output){
          callback(err, output, render[ext].output);
        });
      }
    } else {
      callback(null, content, ext);
    }
  });
};

exports.compileSync = function(source, locals){
  var ext = path.extname(source).substring(1),
    content = file.readSync(source);

  if (renderSync.hasOwnProperty(ext)){
    return renderSync[ext](source, content, locals);
  } else {
    return content;
  }
};