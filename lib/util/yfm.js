var yaml = require('yamljs');

module.exports = function(source){
  var content = source.replace(/^-{3}/, '').split('---');

  if (content.length === 1){
    var result = {_content: content[0]};
  } else {
    var result = yaml.parse(content.shift());
    result._content = content.join('---');
  }

  return result;
};