'use strict';

const Pattern = require('hexo-util').Pattern;
const moment = require('moment-timezone');
const minimatch = require('minimatch');

const DURATION_MINUTE = 1000 * 60;

function isTmpFile(path) {
  const last = path[path.length - 1];
  return last === '%' || last === '~';
}

function isHiddenFile(path) {
  return /(^|\/)[_.]/.test(path);
}

exports.ignoreTmpAndHiddenFile = new Pattern(path => {
  if (isTmpFile(path) || isHiddenFile(path)) return false;
  return true;
});

exports.isTmpFile = isTmpFile;
exports.isHiddenFile = isHiddenFile;

exports.toDate = date => {
  if (!date || moment.isMoment(date)) return date;

  if (!(date instanceof Date)) {
    date = new Date(date);
  }

  if (isNaN(date.getTime())) return;

  return date;
};

exports.timezone = (date, timezone) => {
  if (moment.isMoment(date)) date = date.toDate();

  const offset = date.getTimezoneOffset();
  const ms = date.getTime();
  const target = moment.tz.zone(timezone).utcOffset(ms);
  const diff = (offset - target) * DURATION_MINUTE;

  return new Date(ms - diff);
};

exports.isMatch = (path, patterns) => {
  if (!patterns) return false;
  if (!Array.isArray(patterns)) patterns = [patterns];

  patterns = patterns.filter(value => value);
  if (!patterns.length) return false;

  for (let i = 0, len = patterns.length; i < len; i++) {
    if (minimatch(path, patterns[i])) return true;
  }

  return false;
};
