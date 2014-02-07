var pathFn = require('path'),
  Pattern = require('../../box/pattern');

exports.process = function(data, callback){
  var path = data.params.path,
    extname = pathFn.extname(path),
    name = path.substring(0, path.length - extname.length);

  data.render(function(err, result){
    data.box.i18n.set(name, result);
    callback();
  });
};

exports.pattern = new Pattern('i18n/*path');