var yaml = require('yamljs'),
  extend = require('../extend');

var yml = function(file, content){
  content = content.replace(/\n(\t+)/g, function(match, tabs){
    var result = '\n';

    for (var i=0, len=args.length; i<len; i++){
      result += '  ';
    }

    return result;
  });

  return yaml.parse(content);
};

extend.renderer.register('yml', 'json', yml, true);
extend.renderer.register('yaml', 'json', yml, true);