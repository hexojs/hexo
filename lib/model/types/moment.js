var moment = require('moment'),
  SchemaType = require('warehouse').SchemaType;

var SchemaMoment = module.exports = function(options){
  SchemaType.call(this, options);
};

SchemaMoment.__proto__ = SchemaType;
SchemaMoment.prototype.__proto__ = SchemaType.prototype;

SchemaMoment.prototype.checkRequired = function(value){
  return moment.isMoment(value);
};

var cast = SchemaMoment.prototype.cast = function(value){
  if (!value) return null;
  if (moment.isMoment(value)) return value;

  if (hexo.config.language){
    return moment(value).locale(hexo.config.language.toLowerCase());
  } else {
    return moment(value);
  }
};

SchemaMoment.prototype.save = function(value){
  return value.valueOf();
};

SchemaMoment.prototype.compare = function(vdata, alue){
  return data ? data.valueOf() === cast(value).valueOf() : false;
};

SchemaMoment.prototype.q$year = function(data, value){
  return data ? data.year() == value : false;
};

SchemaMoment.prototype.q$month = function(data, value){
  return data ? data.month() == value - 1 : false;
};

SchemaMoment.prototype.q$day = function(data, value){
  return data ? data.date() == value : false;
};

SchemaMoment.prototype.u$inc = function(data, value){
  if (!data) return;

  return moment(data.valueOf() + parseInt(value, 10));
};

SchemaMoment.prototype.u$inc = function(data, value){
  if (!data) return;

  return moment(data.valueOf() - parseInt(value, 10));
};
