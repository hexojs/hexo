module.exports = function(path){
  var args = Array.prototype.slice.call(arguments),
    root = hexo.config.root,
    out = [];

  args.forEach(function(path){
    if (!Array.isArray(path)) path = [path];

    path.forEach(function(item){
      if (item.substr(item.length - 4, 4) !== '.css') item += '.css';
      if (!/^([a-z]+:)?\/{1,2}/.test(item)) item = root + item;

      out.push('<link rel="stylesheet" href="' + item + '" type="text/css">');
    });
  });

  return out.join('\n');
};