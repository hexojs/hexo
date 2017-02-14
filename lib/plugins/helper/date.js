'use strict';

var moment = require('moment-timezone');
var isMoment = moment.isMoment;
var isDate = require('util').isDate;

function getMoment(date, lang, timezone) {
  if (date == null) date = moment();
  if (!isMoment(date)) date = moment(isDate(date) ? date : new Date(date));

  if (lang) date = date.locale(lang);
  if (timezone) date = date.tz(timezone);

  return date;
}

function toISOString(date) {
  if (date == null) {
    return new Date().toISOString();
  }

  if (date instanceof Date || isMoment(date)) {
    return date.toISOString();
  }

  return new Date(date).toISOString();
}

function dateHelper(date, format) {
  var config = this.config;
  var moment = getMoment(date, getLanguage(this), config.timezone);
  return moment.format(format || config.date_format);
}

function timeHelper(date, format) {
  var config = this.config;
  var moment = getMoment(date, getLanguage(this), config.timezone);
  return moment.format(format || config.time_format);
}

function fullDateHelper(date, format) {
  if (format) {
    var moment = getMoment(date, getLanguage(this), this.config.timezone);
    return moment.format(format);
  }

  return this.date(date) + ' ' + this.time(date);
}

function relativeDateHelper(date) {
  var config = this.config;
  var moment = getMoment(date, getLanguage(this), config.timezone);
  return moment.fromNow();
}

function timeTagHelper(date, format) {
  var config = this.config;
  return '<time datetime="' + toISOString(date) + '">' + this.date(date, format, getLanguage(this), config.timezone) + '</time>';
}

function getLanguage(ctx) {
  return ctx.page.lang || ctx.page.language || ctx.config.language;
}

exports.date = dateHelper;
exports.date_xml = toISOString;
exports.time = timeHelper;
exports.full_date = fullDateHelper;
exports.relative_date = relativeDateHelper;
exports.time_tag = timeTagHelper;
exports.moment = moment;
