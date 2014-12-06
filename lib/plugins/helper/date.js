var moment = require('moment');
var isMoment = moment.isMoment;

function output(date, format){
  if (isMoment(date)){
    return date.format(format);
  } else {
    return moment(date).format(format);
  }
}

function toISOString(date){
  if (date instanceof Date || isMoment(date)){
    return date.toISOString();
  } else {
    return new Date(date).toISOString();
  }
}

exports.date = function(date, format){
  return output(date, format || this.config.date_format);
};

exports.date_xml = toISOString;

exports.time = function(date, format){
  return output(date, format || this.config.time_format);
};

exports.full_date = function(date, format){
  if (format){
    return output(date, format);
  } else {
    return this.date(date) + ' ' + this.time(date);
  }
};

exports.time_tag = function(date, format){
  return '<time datetime="' + toISOString(date) + '">' + this.date(date, format) + '</time>';
};

exports.moment = moment;