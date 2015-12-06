'use strict';

var Pattern = require('hexo-util').Pattern;
var moment = require('moment-timezone');
var minimatch = require('minimatch');
var _ = require('lodash');

var DURATION_MINUTE = 1000 * 60;

function isTmpFile(path) {
  var last = path[path.length - 1];
  return last === '%' || last === '~';
}

function isHiddenFile(path) {
  return /(^|\/)[_\.]/.test(path);
}

exports.ignoreTmpAndHiddenFile = new Pattern(function(path) {
  if (isTmpFile(path) || isHiddenFile(path)) return false;
  return true;
});

exports.isTmpFile = isTmpFile;
exports.isHiddenFile = isHiddenFile;

exports.toDate = function(date) {
  if (!date || moment.isMoment(date)) return date;

  if (!(date instanceof Date)) {
    date = new Date(date);
  }

  if (isNaN(date.getTime())) return;

  return date;
};

exports.timezone = function(date, timezone) {
  if (moment.isMoment(date)) date = date.toDate();

  var offset = date.getTimezoneOffset();
  var ms = date.getTime();
  var target = moment.tz.zone(timezone).offset(ms);
  var diff = (offset - target) * DURATION_MINUTE;

  return new Date(ms - diff);
};

exports.isMatch = function(path, patterns) {
  if (!patterns) return false;
  if (!Array.isArray(patterns)) patterns = [patterns];

  patterns = _.compact(patterns);
  if (!patterns.length) return false;

  for (var i = 0, len = patterns.length; i < len; i++) {
    if (minimatch(path, patterns[i])) return true;
  }

  return false;
};
