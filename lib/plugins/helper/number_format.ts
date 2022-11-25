interface Options {
  delimiter?: string;
  separator?: string;
  precision?: number;
}

function numberFormatHelper(num: number, options: Options = {}) {
  const split = num.toString().split('.');
  let before = split.shift() as string;
  let after = split.length ? split[0] : '';
  const delimiter = options.delimiter || ',';
  const separator = options.separator || '.';
  const { precision } = options;

  if (delimiter) {
    const beforeArr: string[] = [];
    const beforeLength = before.length;
    const beforeFirst = beforeLength % 3;

    if (beforeFirst) beforeArr.push(before.slice(0, beforeFirst));

    for (let i = beforeFirst; i < beforeLength; i += 3) {
      beforeArr.push(before.slice(i, i + 3));
    }

    before = beforeArr.join(delimiter);
  }

  if (precision) {
    const afterLength = after.length;
    let afterResult = '';

    if (afterLength > precision) {
      const afterLast = after[precision];
      const last = parseInt(after[precision - 1], 10);

      afterResult = after.substring(0, precision - 1) + (Number(afterLast) < 5 ? last : last + 1);
    } else {
      afterResult = after;
      for (let i = 0, len = precision - afterLength; i < len; i++) {
        afterResult += '0';
      }
    }

    after = afterResult;
  } else if (precision === 0) {
    after = '';
  }

  return before + (after ? separator + after : '');
}

export = numberFormatHelper;
