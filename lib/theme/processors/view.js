var pathFn = require('path'),
  Pattern = require('../../box/pattern'),
  View = require('../view');

exports.process = function(data, callback){
  var path = data.params.path,
    extname = pathFn.extname(path),
    name = path.substring(0, path.length - extname.length),
    views = data.box.views;

  if (!views.hasOwnProperty(name)) views[name] = {};

  views[name][extname] = new View(data.source, path, data.box);

  callback();
};

exports.pattern = new Pattern('layout/*path');