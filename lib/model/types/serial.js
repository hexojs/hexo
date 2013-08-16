var SchemaType = require('warehouse').SchemaType;

var SchemaSerial = module.exports = function(options){
  var key = 1;

  SchemaType.call(this, options);

  this.default = function(){
    return key++;
  };
};

SchemaSerial.__proto__ = SchemaType;
SchemaSerial.prototype.__proto__ = SchemaType.prototype;