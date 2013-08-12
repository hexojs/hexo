var util = require('../../util'),
  titlecase = util.titlecase;

module.exports = function(data){
  if (!hexo.config.titlecase) return;

  data.title = titlecase(data.title);

  return data;
};