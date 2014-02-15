var rParam = /(\()?([:\*])(\w*)\)?/g;

var Pattern = module.exports = function Pattern(rule){
  if (typeof rule === 'function'){
    this.filter = rule;
  } else if (rule instanceof RegExp){
    this.rule = rule;
    this.params = [];
  } else {
    var params = [];

    var regex = rule.replace(/(\/|\.)/g, '\\$&')
      .replace(rParam, function(match, optional, operator, name){
        params.push(name);

        var str = '';

        if (operator === '*'){
          str = '(.*?)';
        } else {
          str = '([^\\/]+)';
        }

        if (optional) str += '?';

        return str;
      });

    this.rule = new RegExp('^' + regex + '$');
    this.params = params;
  }
};

Pattern.prototype.test = function(str){
  return this.filter ? this.filter(str) : this.rule.test(str);
};

Pattern.prototype.match = function(str){
  if (this.filter) return this.filter(str);
  if (!this.test(str)) return;

  var match = str.match(this.rule),
    params = this.params,
    result = {};

  for (var i = 0, len = match.length; i < len; i++){
    var name = params[i - 1];

    result[i] = match[i];

    if (name) result[name] = match[i];
  }

  return result;
};