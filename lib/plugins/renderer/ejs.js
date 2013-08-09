var ejs = require('ejs');

module.exports = function(data, locals){
  return ejs.render(data.text, locals);
};