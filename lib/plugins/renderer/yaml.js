var yaml = require('js-yaml');
var escape = require('hexo-front-matter').escape;

module.exports = function(data){
  return yaml.load(escape(data.text));
};