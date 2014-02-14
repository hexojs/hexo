var _ = require('lodash');

exports.number_format = function(num, options){
  options = _.extend({
    precision: false,
    delimiter: ',',
    separator: '.'
  }, options);

  var split = num.toString().split('.'),
    i;

  var before = split.shift(),
    after = split.length ? split[0] : '',
    delimiter = options.delimiter,
    precision = options.precision;

  if (delimiter){
    var beforeArr = [],
      beforeLength = before.length,
      beforeFirst = beforeLength % 3;

    if (beforeFirst) beforeArr.push(before.substr(0, beforeFirst));

    for (i = beforeFirst; i < beforeLength; i += 3){
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
      for (i = 0, len = precision - afterLength; i < len; i++){
        afterResult += '0';
      }
    }

    after = afterResult;
  } else if (precision === 0 || precision === '0'){
    after = '';
  }

  return before + (after ? options.separator + after : '');
};