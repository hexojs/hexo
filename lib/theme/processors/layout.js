var pathFn = require('path');

exports.process = function(file, callback){
  /*
  var path = file.path,
    extname = pathFn.extname(path),
    name = path.substring(0, extname.length);

  file.box.layout[name] = extname;
  callback();*/

  var path = file.path,
    extname = pathFn.extname(path),
    name = path.substring(0, extname.length),
    views = file.box.views;

  if (!views.hasOwnProperty(name)) views[name] = {};

  views[name][extname] = new View(file.source, path, file.box);

  //file.box.views[name] = new View(file.source, path, file.box);
  callback();
};

exports.pattern = 'layout/*path';