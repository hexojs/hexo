var extend = require('../extend'),
  _ = require('underscore');

extend.helper.register('tagcloud', function(tags, options){
  var config = hexo.config;

  var defaults = {
    min_font: 8,
    max_font: 22,
    unit: 'px',
    //start_color: '',
    //end_color: '',
    //color: false,
    amount: 40, // 0 = unlimited
    orderby: 'name', // name, length, random
    order: 1,
    exclude: []
  };

  var options = _.extend(defaults, options),
    raw = {},
    result = '';

  if (options.amount !== 0) tags = tags.limit(options.amount);

  var length = tags.length;

  tags.sort('length').each(function(item, i){
    raw[item.name] = '<a href="' + item.permalink + '" style="font-size: ' + (options.min_font * (length - 1 - i) + options.max_font * i) + options.unit + ';">' + item.name + '</a>';
  });

  if (options.orderby === 'random'){
    tags = tags.random();
  } else {
    tags = tags.sort(options.orderby, options.order);
  }

  tags.each(function(item){
    result += raw[item.name];
  });

  return result;
});