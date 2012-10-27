var extend = require('../extend'),
  _ = require('underscore');

extend.helper.register('tagcloud', function(){
  return function(tags, options){
    var config = hexo.config;

    var defaults = {
      min_font: 10,
      max_font: 20,
      unit: 'px',
      //start_color: '',
      //end_color: '',
      //color: false,
      amount: 40, // 0 = unlimited
      orderby: 'name', // name, length, random
      order: 1
      //exclude: []
    };

    var options = _.extend(defaults, options),
      raw = {},
      result = '';

    if (options.amount) tags = tags.limit(options.amount);

    var length = tags.length;

    tags.sort('length').each(function(item, key, i){
      var size = options.min_font + (options.max_font - options.min_font) / length * i;
      raw[item.name] = '<a href="' + item.permalink + '" style="font-size: ' + size.toFixed(2) + options.unit + ';">' + item.name + '</a>';
    });

    if (options.orderby === 'random' || options.orderby === 'rand'){
      tags = tags.random();
    } else {
      tags = tags.sort(options.orderby, options.order);
    }

    tags.each(function(item){
      result += raw[item.name];
    });

    return result;
  }
});