var pathFn = require('path');
var _ = require('lodash');
var chalk = require('chalk');

module.exports = function(ctx){
  return function partial(name, locals, options){
    options = options || {};

    var cache = options.cache;
    var only = options.only;
    var viewDir = this.view_dir;
    var path = pathFn.join(pathFn.dirname(this.filename.substring(viewDir.length)), name);
    var view = ctx.theme.getView(path) || ctx.theme.getView(name);
    var viewLocals = {};

    if (!view){
      ctx.log.warn('Partial %s does not exist.', chalk.magenta(name));
      return '';
    }

    if (only){
      _.extend(viewLocals, locals);
    } else {
      _.extend(viewLocals, _.omit(this, 'layout'), locals);
    }

    if (cache){
      var cacheId = typeof cache === 'string' ? cache : view.path;
      return this.fragment_cache(cacheId, view.renderSync(viewLocals));
    } else {
      return view.renderSync(viewLocals);
    }
  };
};