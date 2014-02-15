var processor = hexo.extend.processor,
  rHiddenFile = /^[^_](?:(?!\/_).)*$/,
  rTmpFile = /[~%]$/;

processor.register('_posts/*path', require('./post'));

processor.register(function(path){
  if (!rHiddenFile.test(path)) return false;
  if (rTmpFile.test(path)) return false;
  if (!hexo.render.isRenderable(path)) return false;

  return true;
}, require('./page'));

processor.register(function(path){
  if (!rHiddenFile.test(path)) return false;
  if (rTmpFile.test(path)) return false;
  if (hexo.render.isRenderable(path)) return false;

  return true;
}, require('./asset'));