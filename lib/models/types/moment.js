var moment = require('moment'),
  SchemaType = require('warehouse').SchemaType,
  util = require('../../util');

function SchemaTypeMoment(name, options){
  SchemaType.call(this, name, options);
}

util.inherits(SchemaTypeMoment, SchemaType);

SchemaTypeMoment.prototype.cast = function(value, data){
  value = SchemaType.prototype.cast.call(this, value, data);

  if (value == null || moment.isMoment(value)) return value;

  var lang = hexo.config.language,
    date = moment(value);

  if (lang && !Array.isArray(lang)){
    return date.locale(lang.toLowerCase());
  } else {
    return date;
  }
};

SchemaTypeMoment.prototype.validate = function(value, data){
  value = SchemaType.prototype.validate.call(this, value, data);
  if (value instanceof Error) return value;

  if (value != null && (moment.invalid(value))){
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
  if (value) return moment(value);
};

SchemaTypeMoment.prototype.value = function(value, data){
  return value ? value.toISOString() : value;
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
  if (value) value.add(update, 'ms');
  return value;
};

SchemaTypeMoment.prototype.u$dec = function(value, update, data){
  if (value) value.subtract(update, 'ms');
  return value;
};

module.exports = SchemaTypeMoment;