var render = require('./extend').renderer.list(),
  renderSync = require('./extend').rendererSync.list(),
  fs = require('fs'),
  async = require('async'),
  path = require('path'),
  _ = require('underscore');

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

  fs.readFile(source, 'utf8', function(err, content){
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
    content = fs.readFileSync(source, 'utf8');

  if (renderSync.hasOwnProperty(ext)){
    return renderSync[ext](source, content, locals);
  } else {
    return content;
  }
};