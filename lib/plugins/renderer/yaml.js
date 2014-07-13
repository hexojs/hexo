var yaml = require('js-yaml'),
  escape = require('../../util').escape.yaml;

module.exports = function(data){
  return yaml.load(escape(data.text));
};