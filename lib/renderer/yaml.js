var yaml = require('js-yaml'),
  extend = require('../extend');

var yml = function(file, content){
  return yaml.load(content);
};

extend.renderer.register('yml', 'json', yml, true);
extend.renderer.register('yaml', 'json', yml, true);