var yaml = require('yamljs');

module.exports = function(source){
  var content = source.match(/^(-{3,})?(\n*([\s\S]+)-{3,})?\n*([\s\S]+)/),
    result = content[3] ? yaml.parse(content[3]) : {};

  result._content = content[4];
  return result;
};