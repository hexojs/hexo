var _ = require('lodash');

module.exports = function(options){
  options = _.extend({
    base: this.page.base,
    format: this.config.pagination_dir + '/%d/',
    total: this.page.total || 1,
    current: this.page.current || 0,
    prev_text: 'Prev',
    next_text: 'Next',
    space: '&hellip;',
    prev_next: true,
    end_size: 1,
    mid_size: 2,
    show_all: false
  }, options);

  var current = options.current,
    total = options.total,
    endSize = options.end_size,
    midSize = options.mid_size,
    space = options.space,
    base = options.base,
    format = options.format,
    self = this,
    front = '',
    back = '',
    i;

  var link = function(i){
    return self.url_for(i == 1 ? base : base + format.replace('%d', i));
  };

  var pageNum = function(i){
    return '<a class="page-number" href="' + link(i) + '">' + i + '</a>';
  };

  if (options.prev_next){
    if (current != 1) front = '<a class="extend prev" rel="prev" href="' + link(current - 1) + '">' + options.prev_text + '</a>';
    if (current != total) back = '<a class="extend next" rel="next" href="' + link(current + 1) + '">' + options.next_text + '</a>';
  }

  if (options.show_all){
    for (i = 1; i <= total; i++){
      if (i == current){
        front += '<span class="page-number current">' + i + '</span>';
      } else {
        front += pageNum(i);
      }
    }
  } else {
    if (endSize){
      var endmax = current <= endSize ? current - 1 : endSize;
      for (i = 1; i <= endmax; i++){
        front += pageNum(i);
      }

      var endmin = total - current <= endSize ? current + 1 : total - endSize + 1;
      for (i = total; i >= endmin; i--){
        back = pageNum(i) + back;
      }

      if (space){
        var space_html = '<span class="space">' + space + '</span>';
        if (current - endSize - midSize > 1) front += space_html;
        if (total - endSize - midSize > current) back = space_html + back;
      }
    }

    if (midSize){
      var midmin = current - midSize <= endSize ? current - midSize + endSize : current - midSize;
      if (midmin > 1){
        for (i = midmin; i <= current - 1; i++){
          front += pageNum(i);
        }
      }

      var midmax = current + midSize + endSize > total ? current + midSize - endSize : current + midSize;
      if (midmax < total){
        for (i = midmax; i >= current + 1; i--){
          back = pageNum(i) + back;
        }
      }
    }

    front += '<span class="page-number current">' + current + '</span>';
  }

  return front + back;
};
