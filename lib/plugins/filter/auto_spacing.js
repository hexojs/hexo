var pangunode = require('pangunode');

module.exports = function(data, callback){
  if (!hexo.config.auto_spacing) return callback();

  data.content = pangunode(data.content);

  callback(null, data);
};