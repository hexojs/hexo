'use strict';

function trimArr(arr){
  var start = 0;
  var length = arr.length;
  var end = length - 1;

  for (; start < length;  start++){
    if (arr[start] !== '') break;
  }

  for (; end > start; end--){
    if (arr[end] !== '') break;
  }

  return arr.slice(start, end + 1);
}

function relativeUrlHelper(from, to){
  from = from || '';
  to = to || '';

  var fromParts = trimArr(from.split('/'));
  var toParts = trimArr(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = 0;

  for (; samePartsLength < length; samePartsLength++){
    if (fromParts[samePartsLength] !== toParts[samePartsLength]) break;
  }

  var out = toParts.slice(samePartsLength);

  for (var i = samePartsLength; i < fromParts.length; i++){
    out.unshift('..');
  }

  return out.join('/');
}

module.exports = relativeUrlHelper;