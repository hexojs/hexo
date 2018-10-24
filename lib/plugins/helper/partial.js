'use strict';

const pathFn = require('path');
const chalk = require('chalk');

module.exports = ctx => function partial(name, locals, options) {
  if (typeof name !== 'string') throw new TypeError('name must be a string!');

  options = options || {};

  const cache = options.cache;
  const viewDir = this.view_dir;
  const currentView = this.filename.substring(viewDir.length);
  const path = pathFn.join(pathFn.dirname(currentView), name);
  const view = ctx.theme.getView(path) || ctx.theme.getView(name);
  const viewLocals = { layout: false };

  if (!view) {
    ctx.log.warn('Partial %s does not exist. %s', chalk.magenta(name), chalk.gray(`(in ${currentView})`));
    return '';
  }

  if (options.only) {
    Object.assign(viewLocals, locals);
  } else {
    Object.assign(viewLocals, this, locals);
  }

  // Partial don't need layout
  viewLocals.layout = false;

  if (cache) {
    const cacheId = typeof cache === 'string' ? cache : view.path;

    return this.fragment_cache(cacheId, () => view.renderSync(viewLocals));
  }

  return view.renderSync(viewLocals);
};
