var yaml = require('js-yaml');
var escape = require('hexo-front-matter').escape;

function yamlHelper(data){
  return yaml.load(escape(data.text));
}

module.exports = yamlHelper;