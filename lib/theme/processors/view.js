var pathFn = require('path'),
  Pattern = require('../../box/pattern'),
  View = require('../view'),
  util = require('../../util'),
  yfm = util.yfm;

exports.process = function(data, callback){
  var path = data.params.path,
    extname = pathFn.extname(path),
    name = path.substring(0, path.length - extname.length),
    views = data.box.views;

  if (!views.hasOwnProperty(name)) views[name] = {};

  var view = views[name][extname];

  if (data.type === 'delete'){
    view = null;
    return callback();
  }

  data.read(function(err, result){
    if (err) return callback(err);
    if (!view) view = views[name][extname] = new View(data.source, path, data.box);

    view.data = yfm(result);
    view.invalidate();

    callback();
  });
};

exports.pattern = new Pattern('layout/*path');