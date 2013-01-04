var extend = require('../extend'),
  _ = require('underscore');

var defaults = {
  base: '/',
  total: 1,
  current: 0,
  prev_text: 'Prev',
  next_text: 'Next',
  space: '&hellip;',
  prev_next: true,
  end_size: 1,
  mid_size: 2,
  show_all: false
};

var format = function(link, text){
  return '<a class="page-number" href="' + link + '">' + text + '</a>';
};

extend.helper.register('paginator', function(){
  return function(options){
    var options = _.extend(options, defaults),
      current = options.current,
      total = options.total,
      base = options.base,
      end_size = options.end_size,
      mid_size = options.mid_size,
      space = options.space,
      front = '',
      back = '';

    if (options.prev_next){
      if (current !== 1) front += '<a class="extend prev" href="' + base + (current - 1) + '">' + options.prev_text + '</a>';
      if (current !== total) back += '<a class="extend next" href="' + base + (current + 1) + '">' + options.next_text + '</a>';
    }

    if (options.show_all){
      for (var i=1; i<=total; i++){
        if (i == current){
          front += '<span class="page-number current">' + i + '</a>';
        } else {
          front += format(base + i, i);
        }
      }
    } else {
      if (end_size){
        var endmax = current <= end_size ? end_size - current : end_size;
        for (var i=1; i<=endmax; i++){
          front += format(base + i, i);
        }

        var endmin = total - current <= end_size ? end_size - (total - current) : end_size;
        for (var i=total; i>=endmin; i--){
          back += format(base + i, i);
        }
      }

      if (space){
        var space_html = '<span class="space">' + space + '</span>';
        if (current - end_size - mid_size > 0) front += space_html;
        if (current + mid_size + 1 < end_size) back += space_html;
      }

      if (mid_size){
        var midmax = current - end_size <= mid_size ? current - end_size - 1 : mid_size;
        for (var i=end_size; i<=midmax; i++){
          front += format(base + i, i);
        }

        var midmin = total - current - end_size <= mid_size ? total - current - end_size : total - end_size - mid_size;
        for (var i=total-end_size; i>=midmin; i--){
          back += format(base + i, i);
        }
      }

      front += '<span class="page-number current">' + current + '</a>';
    }

    return front + back;
  }
});