module.exports = function(path){
  var args = Array.prototype.slice.call(arguments),
    root = hexo.config.root,
    out = [];

  args.forEach(function(path){
    if (!Array.isArray(path)) path = [path];

    path.forEach(function(item){
      if (item.substr(item.length - 3, 3) !== '.js') item += '.js';
      if (!/^([a-z]+:)?\/{1,2}/.test(item)) item = root + item;

      out.push('<script type="text/javascript" src="' + item + '"></script>');
    });
  });

  return out.join('\n');
};