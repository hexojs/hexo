var _ = require('lodash');
var util = require('hexo-util');
var Permalink = util.Permalink;
var permalink;

var ignoreKeys = {
  path: true,
  permalink: true
};

function postPermalinkFilter(data){
  var config = this.config;
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

  var categories = data.categories;

  if (categories.length){
    meta.category = categories.last().slug;
  } else {
    meta.category = config.default_category;
  }

  var keys = Object.keys(data);
  var key = '';

  for (var i = 0, len = keys.length; i < len; i++){
    key = keys[i];

    if (!ignoreKeys[key] && !meta.hasOwnProperty(key)){
      meta[key] = data[key];
    }
  }

  return permalink.stringify(_.defaults(meta, config.permalink_defaults));
}

module.exports = postPermalinkFilter;