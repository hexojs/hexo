var yaml = require('yamljs');

module.exports = function(source){
  var content = source.split('---');

  if (content.length === 1){
    var result = content[0];
  } else {
    var content = content.slice(1),
      result = yaml.parse(content.shift());

    result._content = content.join('---');
  }

  return result;
};