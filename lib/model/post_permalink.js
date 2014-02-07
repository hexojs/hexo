exports.id = function(post){
  return post.id || post._id;
};

exports.title = function(post){
  return post.slug;
};

exports.year = function(post){
  return post.date.format('YYYY');
};

exports.month = function(post){
  return post.date.format('MM');
};

exports.day = function(post){
  return post.date.format('DD');
};

exports.category = function(post){
  var categories = post.categories;

  if (categories.length){
    var category = categories[categories.length - 1],
      Category = hexo.model('Category'),
      slug = Category.get(category).slug;

    return slug;
  } else {
    return hexo.config.default_category;
  }
};