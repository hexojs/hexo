var yaml = require('yamljs'),
  extend = require('../extend');

var yml = function(file, content, callback){
  callback(null, yaml.parse(content));
};

extend.renderer.register('yml', yml);
extend.renderer.register('yaml', yml);