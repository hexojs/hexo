var ejs = require('ejs'),
  _ = require('lodash');

module.exports = function(data, locals){
  return ejs.render(data.text, _.extend({filename: data.path}, locals));
};