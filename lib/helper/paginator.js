var extend = require('../extend'),
  _ = require('underscore');

extend.helper.register('paginator', function(options){
  var config = hexo.config,

  var defaults = {
    base: '/', // Required
    current: 1, // Required
    total: 1, // Required
    show_all: false,
    format: 'plain', // plain, list, array
    next: 'Next',
    prev: 'Prev',
    prev_next: true,
    mid_size: 2,
    end_size: 1
  };

  var options = _.extend(defaults, options),
    arr = [];
});