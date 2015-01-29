'use strict';

var moment = require('moment');
var isMoment = moment.isMoment;

function output(date, format, lang){
  if (!isMoment(date)) date = moment(date);
  if (lang) date = date.locale(lang);

  return date.format(format);
}

function toISOString(date){
  if (date instanceof Date || isMoment(date)){
    return date.toISOString();
  } else {
    return new Date(date).toISOString();
  }
}

function dateHelper(date, format){
  /* jshint validthis: true */
  return output(date, format || this.config.date_format, getLanguage.call(this));
}

function timeHelper(date, format){
  /* jshint validthis: true */
  return output(date, format || this.config.time_format, getLanguage.call(this));
}

function fullDateHelper(date, format){
  /* jshint validthis: true */
  if (format){
    return output(date, format, getLanguage.call(this));
  } else {
    return this.date(date) + ' ' + this.time(date);
  }
}

function timeTagHelper(date, format){
  /* jshint validthis: true */
  return '<time datetime="' + toISOString(date) + '">' + this.date(date, format, getLanguage.call(this)) + '</time>';
}

function getLanguage(){
  /* jshint validthis: true */
  var lang = this.page.lang || this.page.language || this.config.language;
  if (!lang) return;

  if (Array.isArray(lang)) lang = lang[0];

  return lang.toLowerCase();
}

exports.date = dateHelper;
exports.date_xml = toISOString;
exports.time = timeHelper;
exports.full_date = fullDateHelper;
exports.time_tag = timeTagHelper;
exports.moment = moment;