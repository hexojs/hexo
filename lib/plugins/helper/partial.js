'use strict';

var pathFn = require('path');
var _ = require('lodash');
var chalk = require('chalk');

module.exports = function(ctx){
  return function partial(name, locals, options){
    if (typeof name !== 'string') throw new TypeError('name must be a string!');

    options = options || {};

    var cache = options.cache;
    var only = options.only;
    var viewDir = this.view_dir;
    var currentView = this.filename.substring(viewDir.length);
    var path = pathFn.join(pathFn.dirname(currentView), name);
    var view = ctx.theme.getView(path) || ctx.theme.getView(name);
    var viewLocals = {};

    if (!view){
      ctx.log.warn('Partial %s does not exist. %s', chalk.magenta(name), chalk.gray('(in ' + currentView + ')'));
      return '';
    }

    if (only){
      _.extend(viewLocals, locals);
    } else {
      _.extend(viewLocals, this, locals);
    }

    // Partial don't need layout
    viewLocals.layout = false;

    if (cache){
      var cacheId = typeof cache === 'string' ? cache : view.path;

      return this.fragment_cache(cacheId, function(){
        return view.renderSync(viewLocals);
      });
    } else {
      return view.renderSync(viewLocals);
    }
  };
};