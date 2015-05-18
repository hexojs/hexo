'use strict';

function relativeUrlHelper(from, to){
  from = from || '';
  to = to || '';

  var fromParts = from.split('/');
  var toParts = to.split('/');
  var length = Math.min(fromParts.length, toParts.length);
  var i = 0;

  for (; i < length && fromParts[i] === toParts[i]; i++);

  var out = toParts.slice(i);

  for (var j = fromParts.length - i - 1; j > 0; j--){
    out.unshift('..');
  }

  var outLength = out.length;

  // If the last 2 elements of `out` is empty strings, replace them with `index.html`.
  if (outLength > 1 && !out[outLength - 1] && !out[outLength] - 2){
    out = out.slice(0, outLength - 2).concat('index.html');
  }

  return out.join('/').replace(/\/{2,}/g, '/');
}

module.exports = relativeUrlHelper;
