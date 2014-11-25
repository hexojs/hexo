var pathFn = require('path');
var Pattern = require('../../box/pattern');

exports.process = function(data){
  var path = data.params.path;
  var extname = pathFn.extname(path);
  var name = pathFn.substring(0, path.length - extname.length);
  var i18n = this.i18n;

  if (data.type === 'delete'){
    i18n.remove(name);
    return;
  }

  return data.render().then(function(result){
    i18n.set(name, result);
  });
};

exports.pattern = new Pattern('languages/*path');