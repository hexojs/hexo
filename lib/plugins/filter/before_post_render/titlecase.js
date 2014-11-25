var inflection = require('inflection');
var titleize = inflection.titleize;

module.exports = function(data){
  if (!this.config.titlecase || !data.title) return;

  data.title = titleize(data.title);
};