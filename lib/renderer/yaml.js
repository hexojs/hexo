var yaml = require('yamljs'),
  extend = require('../extend');

var yml = function(file, content){
  return yaml.parse(content);
};

extend.render.register('yml', 'json', yml, true);
extend.render.register('yaml', 'json', yml, true);