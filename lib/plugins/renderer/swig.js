var swig = require('swig');

swig.init({tags: hexo.extend.swig.list()});

module.exports = function(data, locals){
  return swig.compile(data.text)(locals);
};