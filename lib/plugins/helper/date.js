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

function dateHelper(date, format){
  return output(date, format || this.config.date_format);
}

function timeHelper(date, format){
  return output(date, format || this.config.time_format);
}

function fullDateHelper(date, format){
  if (format){
    return output(date, format);
  } else {
    return this.date(date) + ' ' + this.time(date);
  }
}

function timeTagHelper(date, format){
  return '<time datetime="' + toISOString(date) + '">' + this.date(date, format) + '</time>';
}

exports.date = dateHelper;
exports.date_xml = toISOString;
exports.time = timeHelper;
exports.full_date = fullDateHelper;
exports.time_tag = timeTagHelper;
exports.moment = moment;