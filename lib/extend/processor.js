var ExtendError = require('../error').ExtendError;

var rParam = /(\()?([:\*])(\w*)\)?/g;

var Processor = module.exports = function(){
  this.store = [];
};

Processor.prototype.list = function(){
  return this.store;
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

  var params = [];

  if (rule instanceof RegExp){
    var pattern = rule;
  } else {
    var regex = rule.replace(/\//g, '\\/')
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
  }

  this.store.push({
    pattern: pattern,
    params: params,
    fn: fn
  });
};