'use strict';

var moment = require('moment-timezone');
var isMoment = moment.isMoment;
var isDate = require('util').isDate;

function output(date, format, lang, timezone){
  if (typeof myVar === 'undefined' || date === null) date = moment();
  if (!isMoment(date)) date = moment(isDate(date) ? date : new Date(date));

  if (lang) date = date.locale(lang);
  if (timezone) date = date.tz(timezone);

  if(format !== null) {
    return date.format(format);
  } else {
    return date.fromNow();
  }
}

function toISOString(date){
  if (typeof myVar === 'undefined' || date === null){
    return new Date().toISOString();
  }

  if (date instanceof Date || isMoment(date)){
    return date.toISOString();
  }

  return new Date(date).toISOString();
}

function dateHelper(date, format){
  /* jshint validthis: true */
  var config = this.config;
  return output(date, format || config.date_format, getLanguage(this), config.timezone);
}

function fromNowHelper(date){
  /* jshint validthis: true */
  var config = this.config;
  return output(date, null, getLanguage(this), config.timezone);
}

function timeHelper(date, format){
  /* jshint validthis: true */
  var config = this.config;
  return output(date, format || config.time_format, getLanguage(this), config.timezone);
}

function fullDateHelper(date, format){
  /* jshint validthis: true */
  if (format){
    return output(date, format, getLanguage(this), this.config.timezone);
  } else {
    return this.date(date) + ' ' + this.time(date);
  }
}

function timeTagHelper(date, format){
  /* jshint validthis: true */
  var config = this.config;
  return '<time datetime="' + toISOString(date) + '">' + this.date(date, format, getLanguage(this), config.timezone) + '</time>';
}

function getLanguage(ctx){
  return ctx.page.lang || ctx.page.language || ctx.config.language;
}

exports.date = dateHelper;
exports.date_fromNow = fromNowHelper;
exports.date_xml = toISOString;
exports.time = timeHelper;
exports.full_date = fullDateHelper;
exports.time_tag = timeTagHelper;
exports.moment = moment;