var filters = {
  id: function(post){
    return post.id || post._id;
  },
  title: function(post){
    return post.slug;
  },
  year: function(post){
    return post.date.format('YYYY');
  },
  month: function(post){
    return post.date.format('MM');
  },
  day: function(post){
    return post.date.format('DD');
  },
  i_month: function(post){
    return post.date.format('M');
  },
  i_day: function(post){
    return post.date.format('D');
  },
  category: function(post){
    var categories = post.categories;

    if (categories.length){
      var category = categories[categories.length - 1],
        Category = hexo.model('Category'),
        slug = Category.get(category).slug;

      return slug;
    } else {
      return hexo.config.default_category;
    }
  }
};

module.exports = function(data){
  return hexo.config.permalink.replace(/:(\w+)/g, function(match, name){
    if (filters.hasOwnProperty(name)){
      return filters[name](data);
    } else {
      return data[name];
    }
  });
};