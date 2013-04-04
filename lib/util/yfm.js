var render = require('../render');

module.exports = function(source){
  var content = source.replace(/^-{3}/, '').split('---');

  if (content.length === 1){
    var result = {_content: content[0]};
  } else {
    var result = render.renderSync({text: content.shift(), engine: 'yaml'});
    result._content = content.join('---');
  }

  return result;
};