import moment from 'moment-timezone';
import micromatch from 'micromatch';

const DURATION_MINUTE = 1000 * 60;

function isMatch(path: string, patterns?: string| string[]) {
  if (!patterns) return false;

  return micromatch.isMatch(path, patterns);
}

function isTmpFile(path: string) {
  return path.endsWith('%') || path.endsWith('~');
}

function isHiddenFile(path: string) {
  return /(^|\/)[_.]/.test(path);
}

function isExcludedFile(path: string, config) {
  if (isTmpFile(path)) return true;
  if (isMatch(path, config.exclude)) return true;
  if (isHiddenFile(path) && !isMatch(path, config.include)) return true;
  return false;
}

export {isTmpFile};
export {isHiddenFile};
export {isExcludedFile};

// This function is used by `asset.ts` and `post.ts`
// To handle dates like `date: Apr 24 2014` in front-matter
export function toDate(date?: string | number | Date | moment.Moment): Date | undefined | moment.Moment {
  if (!date || moment.isMoment(date)) return date as any;

  if (!(date instanceof Date)) {
    // hexo-front-matter now always returns date in UTC
    // but `new Date()` uses local timezone by default
    // We have to reset offset
    // to make the behavior consistent with hexo-front-matter
    date = new Date(date);
    const ms = date.getTime();
    const offset = date.getTimezoneOffset();
    const diff = offset * DURATION_MINUTE;
    date = new Date(ms - diff);
  }

  if (isNaN(date.getTime())) return;

  return date;
}

export function adjustDateForTimezone(date: Date | moment.Moment, timezone: string) {
  if (moment.isMoment(date)) date = date.toDate();

  const ms = date.getTime();
  const target = moment.tz.zone(timezone).utcOffset(ms);
  const diff = target * DURATION_MINUTE;

  return new Date(ms + diff);
}

export {isMatch};
