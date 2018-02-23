'use strict';

function relativeUrlHelper(from = '', to = '') {
  const fromParts = from.split('/');
  const toParts = to.split('/');
  const length = Math.min(fromParts.length, toParts.length);
  let i = 0;

  for (; i < length; i++) {
    if (fromParts[i] !== toParts[i]) break;
  }

  let out = toParts.slice(i);

  for (let j = fromParts.length - i - 1; j > 0; j--) {
    out.unshift('..');
  }

  const outLength = out.length;

  // If the last 2 elements of `out` is empty strings, replace them with `index.html`.
  if (outLength > 1 && !out[outLength - 1] && !out[outLength - 2]) {
    out = out.slice(0, outLength - 2).concat('index.html');
  }

  return out.join('/').replace(/\/{2,}/g, '/');
}

module.exports = relativeUrlHelper;
