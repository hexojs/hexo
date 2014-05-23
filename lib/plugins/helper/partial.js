var pathFn = require('path'),
  _ = require('lodash');

module.exports = function(name, locals, options){
  options = _.extend({
    cache: false,
    only: false
  }, options);

  var viewDir = this.view_dir || this.settings.views,
    path = pathFn.join(pathFn.dirname(this.filename.substring(viewDir.length)), name),
    view = hexo.theme.getView(path) || hexo.theme.getView(name),
    self = this;

  if (!view){
    hexo.log.w('Partial %s does not exist', name);
    return '';
  }

  var partial = function(){
    var viewLocals = {};

    if (options.only){
      _.extend(viewLocals, locals);
    } else {
      _.extend(viewLocals, _.omit(self, 'layout'), locals);
    }

    return view.renderSync(viewLocals);
  };

  if (options.cache){
    var cacheId = typeof options.cache === 'string' ? options.cache : view.path;

    return this.fragment_cache(cacheId, partial);
  } else {
    return partial();
  }
};