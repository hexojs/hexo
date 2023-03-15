import { Pattern } from 'hexo-util';
import moment from 'moment-timezone';
import micromatch from 'micromatch';

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

export const ignoreTmpAndHiddenFile = new Pattern(path => {
  if (isTmpFile(path) || isHiddenFile(path)) return false;
  return true;
});

export {isTmpFile};
export {isHiddenFile};
export {isExcludedFile};

export function toDate(date) {
  if (!date || moment.isMoment(date)) return date;

  if (!(date instanceof Date)) {
    date = new Date(date);
  }

  if (isNaN(date.getTime())) return;

  return date;
}

export function timezone(date, timezone) {
  if (moment.isMoment(date)) date = date.toDate();

  const offset = date.getTimezoneOffset();
  const ms = date.getTime();
  const target = moment.tz.zone(timezone).utcOffset(ms);
  const diff = (offset - target) * DURATION_MINUTE;

  return new Date(ms - diff);
}

export {isMatch};
