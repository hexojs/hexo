var _ = require('lodash');
var util = require('../../util');
var Permalink = util.permalink;
var permalink;

var ignoreKeys = {
  path: true,
  permalink: true
};

module.exports = function(data){
  var config = this.config;
  // var Category = this.model('Category');
  var meta = {
    id: data.id || data._id,
    title: data.slug,
    year: data.date.format('YYYY'),
    month: data.date.format('MM'),
    day: data.date.format('DD'),
    i_month: data.date.format('M'),
    i_day: data.date.format('D')
  };

  if (!permalink || permalink.rule !== config.permalink){
    permalink = new Permalink(config.permalink);
  }
/*
  var categories = data.categories;

  if (categories.length){
    var category = categories[categories.length - 1];
    meta.category = Category.get(category).slug;
  } else {
    meta.category = config.default_category;
  }*/

  var keys = Object.keys(data);
  var key = '';

  for (var i = 0, len = keys.length; i < len; i++){
    key = keys[i];

    if (!ignoreKeys[key] && !meta.hasOwnProperty(key)){
      meta[key] = data[key];
    }
  }

  return permalink.stringify(_.defaults(meta, config.permalink_defaults));
};