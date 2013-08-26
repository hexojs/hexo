var util = require('../../util'),
  titlecase = util.titlecase;

var config = hexo.config;

module.exports = function(data, callback){
  if (!config.titlecase || !data.title) return callback();

  data.title = titlecase(data.title);

  callback(null, data);
};