var yaml = require('yamljs');

module.exports = function(source){
  var content = source.split('---\n');

  if (content.length === 1){
    var result = {_content: content[0]};
  } else {
    var content = content.slice(1),
      result = yaml.parse(content.shift());

    result._content = content.join('---\n');
  }

  return result;
};