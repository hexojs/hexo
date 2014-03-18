var stylus = require('stylus'),
  nib = require('nib');

var getProperty = function(obj, key){
  key = key.replace(/\[(\w+)\]/g, '.$1').replace(/^\./, '');

  var split = key.split('.'),
    result = obj[split[0]];

  for (var i = 1, len = split.length; i < len; i++){
    result = result[split[i]];
  }

  return result;
};

var defineConfig = function(style){
  style.define('hexo-config', function(data){
    return getProperty(hexo._themeConfig, data.val);
  });
};

module.exports = function(data, options, callback){
  var config = hexo.config.stylus || {};

  stylus(data.text)
    .use(nib())
    .use(defineConfig)
    .set('filename', data.path)
    .set('compress', config.compress)
	.set('include css', true)
    .render(callback);
};