import warehouse from 'warehouse';
import { moment } from '../../plugins/helper/date';

// It'll pollute the moment module.
// declare module 'moment' {
//   export default interface Moment extends moment.Moment {
//     _d: Date;
//   // eslint-disable-next-line semi
//   }
// }

class SchemaTypeMoment extends warehouse.SchemaType<moment.Moment> {
  public options: any;

  constructor(name, options = {}) {
    super(name, options);
  }

  cast(value?, data?) {
    value = super.cast(value, data);
    if (value == null) return value;

    return toMoment(value);
  }

  validate(value, data?) {
    value = super.validate(value, data);
    if (value == null) return value;

    value = toMoment(value);

    if (!value.isValid()) {
      throw new Error('`' + value + '` is not a valid date!');
    }

    return value;
  }

  match(value, query, _data?) {
    return value ? value.valueOf() === query.valueOf() : false;
  }

  compare(a?, b?) {
    if (a) {
      if (b) return a - b;
      return 1;
    }

    if (b) return -1;
    return 0;
  }

  parse(value?) {
    if (value) return toMoment(value);
  }

  value(value?, _data?) {
    // FIXME: Same as above. Also a dirty hack.
    return value ? value._d.toISOString() : value;
  }

  q$day(value, query, _data?) {
    return value ? value.date() === query : false;
  }

  q$month(value, query, _data?) {
    return value ? value.month() === query : false;
  }

  q$year(value, query, _data?) {
    return value ? value.year() === query : false;
  }

  u$inc(value, update, _data?) {
    if (!value) return value;
    return value.add(update);
  }

  u$dec(value, update, _data?) {
    if (!value) return value;
    return value.subtract(update);
  }
}

function toMoment(value) {
  // value passed here is a moment-like instance
  // but it's a plain object that methods such as isValid are removed
  // moment.isMoment is judged on its property but not constructor
  // so the plain object still passes the moment.isMoment check

  // hexo-front-matter now always returns date in UTC
  // See https://github.com/hexojs/hexo-front-matter/pull/146
  // We shall specify the timezone UTC here
  // Otherwise, `moment()` set the timezone according to the $TZ on the machine
  // Which still cause confusion
  if (moment.isMoment(value)) return moment((value as any)._d).tz('UTC');
  return moment(value).tz('UTC');
}

export = SchemaTypeMoment;
