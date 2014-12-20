var util = require('hexo-util');
var titlecase = util.titlecase;

module.exports = function(data){
  if (!this.config.titlecase || !data.title) return;

  data.title = titlecase(data.title);
};