var extend = require('../../extend'),
  _ = require('lodash'),
  config = hexo.config,
  root = config.root;

extend.helper.register('tagcloud', function(tags, options){
  if (!options){
    options = tags;
    tags = this.site.tags;
  }

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
    result = '',
    amount = options.amount,
    minFont = options.min_font,
    maxFont = options.max_font,
    unit = options.unit,
    orderby = options.orderby.toLowerCase(),
    order = options.order;

  if (amount) tags = tags.limit(amount);

  var length = tags.length,
    tags = tags.sort('length');

  for (var i=0; i<length; i++){
    var item = tags.eq(i),
      size = minFont + (maxFont - minFont) / length * i;
    raw[item.name] = '<a href="' + root + item.path + '" style="font-size: ' + size.toFixed(2) + unit + ';">' + item.name + '</a>';
  }

  if (orderby === 'random' || orderby === 'rand'){
    tags = tags.random();
  } else {
    tags = tags.sort(orderby, order);
  }

  tags.each(function(item){
    result += raw[item.name];
  });

  return result;
});