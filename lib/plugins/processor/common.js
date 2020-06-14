'use strict';

const { Pattern } = require('hexo-util');
const moment = require('moment-timezone');
const micromatch = require('micromatch');

const DURATION_MINUTE = 1000 * 60;

function isMatch(path, patterns) {
  if (!patterns) return false;

  return micromatch.isMatch(path, patterns);
}

function isTmpFile(path) {
  return path.endsWith('%') || path.endsWith('~');
}

function isHiddenFile(path) {
  return /(^|\/)[_.]/.test(path);
}

function isExcludedFile(path, config) {
  if (isTmpFile(path)) return true;
  if (isMatch(path, config.exclude)) return true;
  if (isHiddenFile(path) && !isMatch(path, config.include)) return true;
  return false;
}

exports.ignoreTmpAndHiddenFile = new Pattern(path => {
  if (isTmpFile(path) || isHiddenFile(path)) return false;
  return true;
});

exports.isTmpFile = isTmpFile;
exports.isHiddenFile = isHiddenFile;
exports.isExcludedFile = isExcludedFile;

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

exports.isMatch = isMatch;
