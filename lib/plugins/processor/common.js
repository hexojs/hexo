'use strict';

var Pattern = require('hexo-util').Pattern;
var moment = require('moment-timezone');

var DURATION_MINUTE = 1000 * 60;

function isTmpFile(path){
  var last = path[path.length - 1];
  return last === '%' || last === '~';
}

function isHiddenFile(path){
  if (path[0] === '_') return true;
  return /\/_/.test(path);
}

exports.ignoreTmpAndHiddenFile = new Pattern(function(path){
  if (isTmpFile(path) || isHiddenFile(path)) return false;
  return true;
});

exports.isTmpFile = isTmpFile;
exports.isHiddenFile = isHiddenFile;

exports.toDate = function(date){
  if (!date || moment.isMoment(date)) return date;

  if (!(date instanceof Date)){
    date = new Date(date);
  }

  if (isNaN(date.getTime())) return;

  return date;
};

exports.timezone = function(date, timezone){
  if (moment.isMoment(date)) date = date.toDate();

  var offset = date.getTimezoneOffset();
  var ms = date.getTime();
  var target = moment.tz.zone(timezone).offset(ms);
  var diff = (offset - target) * DURATION_MINUTE;

  return new Date(ms - diff);
};