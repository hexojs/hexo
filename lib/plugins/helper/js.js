var extend = require('../../extend');

extend.helper.register('js', function(path){
  if (!Array.isArray) path = [path];

  var result = [];

  path.forEach(function(item){
    result.push('<script type="text/javascript" src="' + item + '"></script>';);
  });

  return result.join('\n');
});