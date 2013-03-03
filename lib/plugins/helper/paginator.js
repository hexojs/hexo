var extend = require('../../extend'),
  _ = require('lodash'),
  config = hexo.config;

var defaults = {
  base: '/',
  format: config.pagination_dir + '/%d/',
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

extend.helper.register('paginator', function(options){
  var options = _.extend(defaults, options),
    current = options.current,
    total = options.total,
    end_size = options.end_size,
    mid_size = options.mid_size,
    space = options.space,
    base = options.base,
    format = options.format,
    front = '',
    back = '';

  var link = function(i){
    return i == 1 ? base : base + format.replace('%d', i);
  };

  var pageNum = function(i){
    return '<a class="page-number" href="' + link(i) + '">' + i + '</a>';
  };

  if (options.prev_next){
    if (current !== 1) front = '<a class="extend prev" href="' + link(current - 1) + '">' + options.prev_text + '</a>';
    if (current !== total) back = '<a class="extend next" href="' + link(current + 1) + '">' + options.next_text + '</a>';
  }

  if (options.show_all){
    for (var i=1; i<=total; i++){
      if (i == current){
        front += '<span class="page-number current">' + i + '</span>';
      } else {
        front += pageNum(i);
      }
    }
  } else {
    if (end_size){
      var endmax = current <= end_size ? current - 1 : end_size;
      for (var i=1; i<=endmax; i++){
        front += pageNum(i);
      }

      var endmin = total - current <= end_size ? current + 1 : total - end_size + 1;
      for (var i=total; i>=endmin; i--){
        back = pageNum(i) + back;
      }

      if (space){
        var space_html = '<span class="space">' + space + '</span>';
        if (current - end_size - mid_size > 1) front += space_html;
        if (total - end_size - mid_size > current) back = space_html + back;
      }
    }

    if (mid_size){
      var midmin = current - mid_size <= end_size ? current - mid_size + end_size : current - mid_size;
      if (midmin > 1){
        for (var i=midmin; i<=current-1; i++){
          front += pageNum(i);
        }
      }

      var midmax = current + mid_size + end_size > total ? current + mid_size - end_size : current + mid_size;
      if (midmax < total){
        for (var i=midmax; i>=current+1; i--){
          back = pageNum(i) + back;
        }
      }
    }

    front += '<span class="page-number current">' + current + '</span>';
  }

  return front + back;
});