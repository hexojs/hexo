var yaml = require('js-yaml');
var escape = require('../../util').escape.yaml;

module.exports = function(data){
  return yaml.load(escape(data.text));
};