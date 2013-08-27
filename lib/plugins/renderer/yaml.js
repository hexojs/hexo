var yaml = require('yamljs'),
  escape = require('../../util').escape.yaml;

module.exports = function(data){
  return yaml.parse(escape(data.text));
};