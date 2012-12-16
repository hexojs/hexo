var yaml = require('yamljs'),
  extend = require('../extend');

var yml = function(file, content){
  return yaml.parse(content);
};

extend.renderer.register('yml', 'json', yml, true);
extend.renderer.register('yaml', 'json', yml, true);