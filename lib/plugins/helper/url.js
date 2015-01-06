var url = require('url');

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

function urlForHelper(path){
  path = path || '/';

  var config = this.config;
  var root = config.root;
  var data = url.parse(path);

  if (!data.protocol && path.substring(0, 2) !== '//'){
    if (config.relative_link){
      path = this.relative_url(this.path, path);
    } else {
      if (path.substring(0, root.length) !== root){
        if (path.substring(0, 1) === '/'){
          path = root.substring(0, root.length - 1) + path;
        } else {
          path = root + path;
        }
      }
    }
  }

  return path;
}

exports.relative_url = relativeUrlHelper;
exports.url_for = urlForHelper;