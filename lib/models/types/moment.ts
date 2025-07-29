import warehouse from 'warehouse';
import { moment } from '../../plugins/helper/date.js';

// It'll pollute the moment module.
// declare module 'moment' {
//   export default interface Moment extends moment.Moment {
//     _d: Date;
//   // eslint-disable-next-line semi
//   }
// }

class SchemaTypeMoment extends warehouse.SchemaType<moment.Moment> {
  declare options: any;

  constructor(name: string, options = {}) {
    super(name, options);
  }

  cast<T = moment.Moment>(value?: any, data?: any): T {
    value = super.cast(value, data);
    if (value == null) return value;

    // If the value is already a moment instance, return as is (typed)
    if (moment.isMoment(value)) return value as T;
    // Otherwise, convert to moment
    return toMoment(value) as T;
  }

  validate<T = moment.Moment>(value: any, data?: any): T {
    value = super.validate(value, data);
    if (value == null) return value;

    // If already a moment instance, use as is, else convert
    const m = moment.isMoment(value) ? value : toMoment(value);

    if (!m.isValid()) {
      throw new Error('`' + value + '` is not a valid date!');
    }

    return m as T;
  }

  match(
    value: moment.Moment | moment.MomentInput | undefined,
    query: moment.Moment | moment.MomentInput | undefined,
    _data?: any
  ): boolean {
    if (!value || !query) return false;
    if (typeof value.valueOf === 'function' && typeof query.valueOf === 'function') {
      return value.valueOf() === query.valueOf();
    }
    return false;
  }

  compare(a?, b?) {
    if (a) {
      if (b) return a - b;
      return 1;
    }

    if (b) return -1;
    return 0;
  }

  parse(value?: moment.MomentInput): moment.Moment | undefined {
    if (value) return toMoment(value);
  }

  value(value?: moment.Moment, _data?: any): string | undefined {
    // Backward compatibility: try value._d.toISOString(), fallback to value.toISOString()
    if (!value) return undefined;
    // Prefer public API if available
    if (typeof value.toISOString === 'function') {
      try {
        return value.toISOString();
      } catch {}
    }
    // Fallback for legacy moment objects
    const raw = (value as any)._d;
    if (raw && typeof raw.toISOString === 'function') {
      try {
        return raw.toISOString();
      } catch {}
    }
    return undefined;
  }

  q$day(value: moment.Moment, query: number, _data?: undefined) {
    return value ? value.date() === query : false;
  }

  q$month(value: moment.Moment, query: number, _data?: undefined) {
    return value ? value.month() === query : false;
  }

  q$year(value: moment.Moment, query: number, _data?: undefined) {
    return value ? value.year() === query : false;
  }

  u$inc(value: moment.Moment, update: moment.DurationInputArg1, _data?: undefined) {
    if (!value) return value;
    return value.add(update);
  }

  u$dec(value: moment.Moment, update: moment.DurationInputArg1, _data?: undefined) {
    if (!value) return value;
    return value.subtract(update);
  }
}

export function toMoment(value: moment.Moment | moment.MomentInput): moment.Moment {
  // If already a moment instance, return as is
  if (moment.isMoment(value)) return value;

  // If value is a moment-like object (with _d), extract the native Date
  if (value && typeof value === 'object' && '_d' in value && value._d instanceof Date) {
    return moment(value._d);
  }

  // If value is a Date or primitive (string, number, array), convert directly
  if (value instanceof Date || typeof value === 'string' || typeof value === 'number' || Array.isArray(value)) {
    return moment(value);
  }

  // If object with a .date() method
  if (value && typeof value === 'object' && typeof(value as any).date === 'function') {
    return moment((value as any).date());
  }

  // Fallback to moment constructor
  return moment(value);
}

// For ESM/CommonJS compatibility
export default SchemaTypeMoment;
if (typeof module !== 'undefined' && typeof module.exports === 'object' && module.exports !== null) {
  module.exports = SchemaTypeMoment;
  module.exports.default = SchemaTypeMoment;
  module.exports.toMoment = toMoment;
}
