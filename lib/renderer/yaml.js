var yaml = require('yamljs'),
  extend = require('../extend');

var yml = function(file, content){
  return yaml.parse(content);
};

extend.renderer.register('yml', yml, true);
extend.renderer.register('yaml', yml, true);