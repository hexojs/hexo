// paranoid-auto-spacing by gibuloto
// https://github.com/gibuloto/paranoid-auto-spacing

var extend = require('../../extend'),
  config = hexo.config;

extend.filter.register('post', function(data){
  if (!config.auto_spacing) return;

  data.content = data.content
    .replace(/([\u4e00-\u9fa5\u3040-\u30FF])([a-z0-9@#&;=_\[\$\%\^\*\-\+\(\/])/ig, '$1 $2')
    .replace(/([a-z0-9#!~&;=_\]\,\.\:\?\$\%\^\*\-\+\)\/])([\u4e00-\u9fa5\u3040-\u30FF])/ig, '$1 $2');

  return data;
});