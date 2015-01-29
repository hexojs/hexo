'use strict';

var moment = require('moment-timezone');
var SchemaType = require('warehouse').SchemaType;
var util = require('util');

function SchemaTypeMoment(name, options){
  SchemaType.call(this, name, options);
}

util.inherits(SchemaTypeMoment, SchemaType);

function toMoment(value){
  // NEED FIX: Something is wrong when using a moment instance. I try to get the
  // original date object and create a new moment object again.
  if (moment.isMoment(value)) return moment(value._d);
  return moment(value);
}

SchemaTypeMoment.prototype.cast = function(value, data){
  value = SchemaType.prototype.cast.call(this, value, data);
  if (value == null) return value;

  var options = this.options;
  value = toMoment(value);

  if (options.language) value = value.locale(options.language);
  if (options.timezone) value = value.tz(options.timezone);

  return value;
};

SchemaTypeMoment.prototype.validate = function(value, data){
  value = SchemaType.prototype.validate.call(this, value, data);
  if (value instanceof Error) return value;
  if (value == null) return value;

  value = toMoment(value);

  if (!value.isValid()){
    return new Error('`' + value + '` is not a valid date!');
  }

  return value;
};

SchemaTypeMoment.prototype.match = function(value, query, data){
  return value ? value.valueOf() === query.valueOf() : false;
};

SchemaTypeMoment.prototype.compare = function(a, b){
  if (a){
    if (b){ // a && b
      return a - b;
    } else { // a && !b
      return 1;
    }
  } else {
    if (b){ // !a && b
      return -1;
    } else { // !a && !b
      return 0;
    }
  }
};

SchemaTypeMoment.prototype.parse = function(value, data){
  if (value) return toMoment(value);
};

SchemaTypeMoment.prototype.value = function(value, data){
  // NEED FIX: Same as above. Also a dirty hack.
  return value ? value._d.toISOString() : value;
};

SchemaTypeMoment.prototype.q$day = function(value, query, data){
  return value ? value.date() === query : false;
};

SchemaTypeMoment.prototype.q$month = function(value, query, data){
  return value ? value.month() === query : false;
};

SchemaTypeMoment.prototype.q$year = function(value, query, data){
  return value ? value.year() === query : false;
};

SchemaTypeMoment.prototype.u$inc = function(value, update, data){
  if (!value) return value;
  return value.add(update);
};

SchemaTypeMoment.prototype.u$dec = function(value, update, data){
  if (!value) return value;
  return value.subtract(update);
};

module.exports = SchemaTypeMoment;