var util = require('../../util'),
  titlecase = util.titlecase;

module.exports = function(data, callback){
  if (!hexo.config.titlecase || !data.title) return callback();

  data.title = titlecase(data.title);

  callback(null, data);
};