module.exports = function(options){
  options = options || {};

  var current = options.current || 0;
  var total = options.total || 1;
  var endSize = options.end_size || 1;
  var midSize = options.mid_size || 2;
  var space = options.space || '&hellip;';
  var base = options.base || this.page.base;
  var format = options.format || this.config.pagination_dir + '/%d/';
  var prevText = options.prev_text || 'Prev';
  var nextText = options.next_text || 'Next';
  var prevNext = options.hasOwnProperty('prev_next') ? options.prev_next : true;
  var self = this;
  var front = '';
  var back = '';
  var i;

  function link(i){
    return self.url_for(i === 1 ? base : base + format.replace('%d', i));
  }

  function pageNum(i){
    return '<a class="page-number" href="' + link(i) + '">' + i + '</a>';
  }

  if (prevNext){
    if (current !== 1) front = '<a class="extend prev" rel="prev" href="' + link(current - 1) + '">' + prevText + '</a>';
    if (current !== total) back = '<a class="extend next" rel="next" href="' + link(current + 1) + '">' + nextText + '</a>';
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
