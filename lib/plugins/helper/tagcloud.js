var _ = require('lodash'),
  config = hexo.config,
  root = config.root;

module.exports = function(tags, options){
  if (!options){
    options = tags;
    tags = this.site.tags._createQuery();
  }

  var options = _.extend({
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
  }, options);

  var min = options.min_font,
    max = options.max_font,
    orderby = options.orderby,
    order = options.order,
    unit = options.unit;

  tags = tags.sort('length');

  if (options.amount) tags = tags.limit(options.amount);

  if (orderby === 'random' || orderby === 'rand'){
    tags = tags.random();
  } else {
    tags = tags.sort(orderby, order);
  }

  var length = tags.length,
    result = '';

  for (var i = 0; i < length; i++){
    var item = tags.eq(i),
      size = min + (max - min) / length * i;

    result += '<a href="' + root + item.path + '" style="font-size: ' + size.toFixed(2) + unit + ';">' + item.name + '</a>';
  }

  return result;
};
