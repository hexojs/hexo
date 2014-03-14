var pathFn = require('path'),
  Pattern = require('../../box/pattern');

exports.process = function(data, callback){
  var path = data.params.path,
    extname = pathFn.extname(path),
    name = path.substring(0, path.length - extname.length),
    i18n = data.box.i18n;

  if (data.type === 'delete'){
    i18n.remove(name);
    return callback();
  }

  data.render(function(err, result){
    if (err) return callback(err);

    i18n.set(name, result);
    callback();
  });
};

exports.pattern = new Pattern('languages/*path');