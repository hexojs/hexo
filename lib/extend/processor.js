var ExtendError = require('../error').ExtendError;

var rParam = /(\()?([:\*])(\w*)\)?/g;

var Processor = module.exports = function(){
  this.store = [];
};

Processor.prototype.list = function(){
  return this.store;
};

var format = Processor.prototype.format = function(rule){
  var params = [];

  var regex = rule.replace(/(\/|\.)/g, '\\$&')
    .replace(rParam, function(match, optional, operator, name){
      params.push(name);

      if (operator === '*'){
        var str = '(.*?)'
      } else {
        var str = '([^\\/]+)'
      }

      if (optional) str += '?';

      return str;
    });

  var pattern = new RegExp('^' + regex + '$');

  return {
    pattern: pattern,
    params: params
  };
};

Processor.prototype.register = function(rule, fn){
  if (!fn){
    if (typeof rule === 'function'){
      fn = rule;
      rule = /(.*)/;
    } else {
      throw new ExtendError('Processor function is not defined');
    }
  }

  if (rule instanceof RegExp){
    var pattern = rule;
  } else {
    var obj = format(rule),
      pattern = obj.pattern,
      params = obj.params;
  }

  this.store.push({
    pattern: pattern,
    params: params || [],
    fn: fn
  });
};