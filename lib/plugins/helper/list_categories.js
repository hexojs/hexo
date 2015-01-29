'use strict';

function listCategoriesHelper(categories, options){
  /* jshint validthis: true */
  if (!options && (!categories || !categories.hasOwnProperty('length'))){
    options = categories;
    categories = this.site.categories;
  }

  if (!categories || !categories.length) return '';
  options = options || {};

  var style = options.hasOwnProperty('style') ? options.style : 'list';
  var showCount = options.hasOwnProperty('show_count') ? options.show_count : true;
  var className = options.class || 'category';
  var depth = options.depth ? parseInt(options.depth, 10) : 0;
  var orderby = options.orderby || 'name';
  var order = options.order || 1;
  var transform = options.transform;
  var separator = options.hasOwnProperty('separator') ? options.separator : ', ';
  var result = '';
  var self = this;

  function prepareQuery(parent){
    var query = {};

    if (parent){
      query.parent = parent;
    } else {
      query.parent = {$exists: false};
    }

    return categories.find(query).sort(orderby, order).filter(function(cat){
      return cat.length;
    });
  }

  function hierarchicalList(level, parent){
    var result = '';

    prepareQuery(parent).forEach(function(cat, i){
      result += '<li class="' + className + '-list-item">';

      result += '<a class="' + className + '-list-link" href="' + self.url_for(cat.path) + '">';
      result += transform ? transform(cat.name) : cat.name;
      result += '</a>';

      if (showCount){
        result += '<span class="' + className + '-list-count">' + cat.length + '</span>';
      }

      if (!depth || level + 1 < depth){
        var child = hierarchicalList(level + 1, cat._id);

        if (child){
          result += '<ul class="' + className + '-list-child">' + child + '</ul>';
        }
      }

      result += '</li>';
    });

    return result;
  }

  function flatList(level, parent){
    var result = '';

    prepareQuery(parent).forEach(function(cat, i){
      if (i || level) result += separator;

      result += '<a class="' + className + '-link" href="' + self.url_for(cat.path) + '">';
      result += transform ? transform(cat.name) : cat.name;

      if (showCount){
        result += '<span class="' + className + '-count">' + cat.length + '</span>';
      }

      result += '</a>';

      if (!depth || level + 1 < depth){
        result += flatList(level + 1, cat._id);
      }
    });

    return result;
  }

  if (style === 'list'){
    result += '<ul class="' + className + '-list">' + hierarchicalList(0) + '</ul>';
  } else {
    result += flatList(0);
  }

  return result;
}

module.exports = listCategoriesHelper;