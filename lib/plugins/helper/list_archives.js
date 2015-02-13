'use strict';

function listArchivesHelper(options){
  /* jshint validthis: true */
  options = options || {};

  var config = this.config;
  var archiveDir = config.archive_dir;
  var timezone = config.timezone;
  var lang = this.page.lang || this.page.language || config.language;
  var format = options.format;
  var type = options.type || 'monthly';
  var style = options.hasOwnProperty('style') ? options.style : 'list';
  var showCount = options.hasOwnProperty('show_count') ? options.show_count : true;
  var transform = options.transform;
  var separator = options.hasOwnProperty('separator') ? options.separator : ', ';
  var className = options.class || 'archive';
  var order = options.order || -1;
  var result = '';
  var self = this;

  if (!format){
    format = type === 'monthly' ? 'MMMM YYYY' : 'YYYY';
  }

  var posts = this.site.posts.sort('date', order);
  if (!posts.length) return result;

  var data = [];
  var length = 0;

  posts.forEach(function(post){
    // Clone the date object to avoid pollution
    var date = post.date.clone();

    if (timezone) date = date.tz(timezone);
    if (lang) date = date.locale(lang);

    var year = date.year();
    var month = date.month() + 1;
    var name = date.format(format);
    var lastData = data[length - 1];

    if (!lastData || lastData.name !== name){
      length = data.push({
        name: name,
        year: year,
        month: month,
        count: 1
      });
    } else {
      lastData.count++;
    }
  });

  function link(item){
    var url = archiveDir + '/' + item.year + '/';

    if (type === 'monthly'){
      if (item.month < 10) url += '0';
      url += item.month + '/';
    }

    return self.url_for(url);
  }

  var item, i, len;

  if (style === 'list'){
    result += '<ul class="' + className + '-list">';

    for (i = 0, len = data.length; i < len; i++){
      item = data[i];

      result += '<li class="' + className + '-list-item">';

      result += '<a class="' + className + '-list-link" href="' + link(item) + '">';
      result += transform ? transform(item.name) : item.name;
      result += '</a>';

      if (showCount){
        result += '<span class="' + className + '-list-count">' + item.count + '</span>';
      }

      result += '</li>';
    }

    result += '</ul>';
  } else {
    for (i = 0, len = data.length; i < len; i++){
      item = data[i];

      if (i) result += separator;

      result += '<a class="' + className + '-link" href="' + link(item) + '">';
      result += transform ? transform(item.name) : item.name;

      if (showCount){
        result += '<span class="' + className + '-count">' + item.count + '</span>';
      }

      result += '</a>';
    }
  }

  return result;
}

module.exports = listArchivesHelper;