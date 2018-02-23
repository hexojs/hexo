'use strict';

function numberFormatHelper(num, options = {}) {
  const split = num.toString().split('.');
  let before = split.shift();
  let after = split.length ? split[0] : '';
  const delimiter = options.delimiter || ',';
  const separator = options.separator || '.';
  const precision = options.precision;
  let i, len;

  if (delimiter) {
    const beforeArr = [];
    const beforeLength = before.length;
    const beforeFirst = beforeLength % 3;

    if (beforeFirst) beforeArr.push(before.substr(0, beforeFirst));

    for (i = beforeFirst; i < beforeLength; i += 3) {
      beforeArr.push(before.substr(i, 3));
    }

    before = beforeArr.join(delimiter);
  }

  if (precision) {
    const afterLength = after.length;
    let afterResult = '';

    if (afterLength > precision) {
      const afterLast = after[precision];
      const last = parseInt(after[precision - 1], 10);

      afterResult = after.substr(0, precision - 1) + (afterLast < 5 ? last : last + 1);
    } else {
      afterResult = after;
      for (i = 0, len = precision - afterLength; i < len; i++) {
        afterResult += '0';
      }
    }

    after = afterResult;
  } else if (precision === 0 || precision === '0') {
    after = '';
  }

  return before + (after ? separator + after : '');
}

module.exports = numberFormatHelper;
