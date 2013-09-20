var _ = require('lodash');

module.exports = function(tags, options){
  if (!options){
    options = tags;
    tags = this.site.tags;
  }

  if (!tags.length) return '';

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
  }, options);

  var min = options.min_font,
    max = options.max_font,
    orderby = options.orderby,
    order = options.order,
    unit = options.unit,
    root = this.config.root;

  if (orderby === 'random' || orderby === 'rand'){
    tags = tags.random();
  } else {
    tags = tags.sort(orderby, order);
  }

  if (options.amount) tags = tags.limit(options.amount);

  var sizes = [];

  tags.sort('length').each(function(tag){
    var length = tag.length;

    if (sizes.indexOf(length) > -1) return;

    sizes.push(length);
  });

  var length = sizes.length,
    result = '';

  tags.each(function(tag){
    var size = min + (max - min) / (length - 1) * sizes.indexOf(tag.length);

    result += '<a href="' + root + tag.path + '" style="font-size: ' + size.toFixed(2) + unit + ';">' + tag.name + '</a>';
  });

  return result;
};
