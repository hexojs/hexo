'use strict';

const moment = require('moment-timezone');
const { SchemaType } = require('warehouse');

class SchemaTypeMoment extends SchemaType {
  constructor(name, options = {}) {
    super(name, options);
  }
}

function toMoment(value) {
  // FIXME: Something is wrong when using a moment instance. I try to get the
  // original date object and create a new moment object again.
  if (moment.isMoment(value)) return moment(value._d);
  return moment(value);
}

SchemaTypeMoment.prototype.cast = function(value, data) {
  value = SchemaType.prototype.cast.call(this, value, data);
  if (value == null) return value;

  const { options } = this;
  value = toMoment(value);

  if (options.language) value = value.locale(options.language);
  if (options.timezone) value = value.tz(options.timezone);

  return value;
};

SchemaTypeMoment.prototype.validate = function(value, data) {
  value = SchemaType.prototype.validate.call(this, value, data);
  if (value == null) return value;

  value = toMoment(value);

  if (!value.isValid()) {
    throw new Error('`' + value + '` is not a valid date!');
  }

  return value;
};

SchemaTypeMoment.prototype.match = function(value, query, data) {
  return value ? value.valueOf() === query.valueOf() : false;
};

SchemaTypeMoment.prototype.compare = (a, b) => {
  if (a) {
    if (b) return a - b;
    return 1;
  }

  if (b) return -1;
  return 0;
};

SchemaTypeMoment.prototype.parse = (value, data) => {
  if (value) return toMoment(value);
};

SchemaTypeMoment.prototype.value = function(value, data) {
  // FIXME: Same as above. Also a dirty hack.
  return value ? value._d.toISOString() : value;
};

SchemaTypeMoment.prototype.q$day = function(value, query, data) {
  return value ? value.date() === query : false;
};

SchemaTypeMoment.prototype.q$month = function(value, query, data) {
  return value ? value.month() === query : false;
};

SchemaTypeMoment.prototype.q$year = function(value, query, data) {
  return value ? value.year() === query : false;
};

SchemaTypeMoment.prototype.u$inc = (value, update, data) => {
  if (!value) return value;
  return value.add(update);
};

SchemaTypeMoment.prototype.u$dec = (value, update, data) => {
  if (!value) return value;
  return value.subtract(update);
};

module.exports = SchemaTypeMoment;
