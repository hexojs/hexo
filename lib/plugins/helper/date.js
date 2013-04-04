var extend = require('../../extend'),
  moment = require('moment'),
  isMoment = moment.isMoment,
  config = hexo.config,
  dateFormat = config.date_format,
  timeFormat = config.time_format,
  fullFormat = dateFormat + ' ' + timeFormat;

var result = function(date, format){
  if (isMoment(date)){
    return date.format(format);
  } else {
    return moment(date).format(format);
  }
};

var toISOString = function(date){
  if (isMoment(date)){
    return date.toDate().toISOString();
  } else {
    return date.toISOString();
  }
};

extend.helper.register('date', function(date, format){
  return result(date, format || dateFormat);
});

extend.helper.register('date_xml', toISOString);

extend.helper.register('time', function(date, format){
  return result(date, format || timeFormat);
});

extend.helper.register('full_date', function(date, format){
  return result(date, format || fullFormat);
});

extend.helper.register('time_tag', function(date, format){
  return '<time datetime="' + toISOString(date) + '">' + result(date, format || fullFormat) + '</time>';
});

extend.helper.register('moment', moment);