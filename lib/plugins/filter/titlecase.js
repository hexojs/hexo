var extend = require('../../extend'),
  util = require('../../util'),
  titlecase = util.titlecase,
  config = hexo.config;

extend.filter.register('pre', function(data){
  if (!config.titlecase) return;

  data.title = titlecase(data.title);

  return data;
});