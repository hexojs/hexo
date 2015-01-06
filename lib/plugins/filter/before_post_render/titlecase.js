var util = require('hexo-util');
var titlecase = util.titlecase;

function titlecaseFilter(data){
  if (!this.config.titlecase || !data.title) return;

  data.title = titlecase(data.title);
}

module.exports = titlecaseFilter;