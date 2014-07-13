var _ = require('lodash'),
  Permalink = require('../../util').permalink,
  permalink;

module.exports = function(data){
  var config = hexo.config;

  if (!permalink || permalink.rule !== config.permalink){
    permalink = new Permalink(config.permalink);
  }

  var meta = {
    id: data.id || data._id,
    title: data.slug,
    year: data.date.format('YYYY'),
    month: data.date.format('MM'),
    day: data.date.format('DD'),
    i_month: data.date.format('M'),
    i_day: data.date.format('D')
  };

  var categories = data.categories;

  if (categories.length){
    var category = categories[categories.length - 1],
      Category = hexo.model('Category');

    meta.category = Category.get(category).slug;
  } else {
    meta.category = config.default_category;
  }

  _.each(data, function(value, i){
    if (!meta.hasOwnProperty(i)) meta[i] = value;
  });

  return permalink.stringify(_.extend({}, config.permalink_defaults, meta));
};