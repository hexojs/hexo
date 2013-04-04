var extend = require('../../extend'),
  _ = require('lodash');

extend.helper.register('number_format', function(num, options){
  var defaults = {
    precision: false,
    delimiter: ',',
    separator: '.'
  };

  var num = num.toString().split('.'),
    options = _.extend(defaults, options);

  var before = num.shift(),
    after = num.length ? num[0] : '',
    delimiter = options.delimiter,
    precision = options.precision;

  if (delimiter){
    var beforeArr = [],
      beforeLength = before.length,
      beforeFirst = beforeLength % 3;

    if (beforeFirst) beforeArr.push(before.substr(0, beforeFirst));

    for (var i = beforeFirst; i < beforeLength; i += 3){
      beforeArr.push(before.substr(i, 3));
    }

    before = beforeArr.join(delimiter);
  }

  if (precision){
    var afterLength = after.length,
      afterResult = '';

    if (afterLength > precision){
      var afterLast = after[precision],
        last = parseInt(after[precision - 1]);

      afterResult = after.substr(0, precision - 1) + (afterLast < 5 ? last : last + 1);
    } else {
      afterResult = after;
      for (var i = 0, len = precision - afterLength; i < len; i++){
        afterResult += '0';
      }
    }

    after = afterResult;
  }

  return before + (after ? options.separator + after : '');
});