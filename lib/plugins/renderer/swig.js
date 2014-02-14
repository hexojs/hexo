var swig = require('swig');

module.exports = function(data, locals){
  return swig.compile(data.text)(locals);
};