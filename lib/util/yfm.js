var yaml = require('yamljs');

module.exports = function(source){
  var content = source.match(/^(-{3,})?\n*([\s\S]*)\n-{3,}\n+([\s\S]*)/),
    result = {};

  if (content){
    if (content[2]) result = yaml.parse(content[2]);
    result._content = content[3];
  } else {
    result._content = source;
  }

  return result;
};