var moment = require('moment'),
  isMoment = moment.isMoment;

var result = function(date, format){
  if (isMoment(date)){
    return date.format(format);
  } else {
    return moment(date).format(format);
  }
};

var toISOString = function(date){
  if (!date) date = new Date();

  if (date instanceof Date){
    return date.toISOString();
  } else if (isMoment(date)){
    return date.toDate().toISOString();
  } else {
    return new Date(date).toISOString();
  }
};

exports.date = function(date, format){
  return result(date || new Date(), format || hexo.config.date_format);
};

exports.date_xml = toISOString;

exports.time = function(date, format){
  return result(date || new Date(), format || hexo.config.time_format);
};

exports.full_date = function(date, format){
  var config = hexo.config;

  return result(date || new Date(), format || config.date_format + ' ' + config.time_format);
};

exports.time_tag = function(date, format){
  date = date || new Date();

  return '<time datetime="' + toISOString(date) + '">' + result(date, format || hexo.config.date_format) + '</time>';
};

exports.moment = moment;