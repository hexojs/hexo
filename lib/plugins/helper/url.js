var url = require('url');

var trimArr = function(arr){
  var start = 0,
    length = arr.length,
    end = length - 1;

  for (; start < length;  start++){
    if (arr[start] !== '') break;
  }

  for (; end > start; end--){
    if (arr[end] !== '') break;
  }

  return arr.slice(start, end + 1);
};

exports.relative_url = function(from, to){
  from = from || '';
  to = to || '';

  var fromParts = trimArr(from.split('/')),
    toParts = trimArr(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length),
    samePartsLength = 0;

  for (; samePartsLength < length; samePartsLength++){
    if (fromParts[samePartsLength] !== toParts[samePartsLength]) break;
  }

  var out = toParts.slice(samePartsLength);

  for (var i = samePartsLength; i < fromParts.length; i++){
    out.unshift('..');
  }

  return out.join('/');
};

exports.url_for = function(path){
  path = path || '/';

  var config = this.config || hexo.config,
    root = config.root,
    data = url.parse(path);

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
};
