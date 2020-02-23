'use strict';

const { dirname, join } = require('path');
const { Cache } = require('hexo-util');
const viewCache = new Cache();

module.exports = ctx => function partial(name, locals, options = {}) {
  if (typeof name !== 'string') throw new TypeError('name must be a string!');

  let view;
  if (viewCache.has(name)) {
    view = viewCache.get(name);
  } else {
    const viewDir = this.view_dir;
    const currentView = this.filename.substring(viewDir.length);
    const path = join(dirname(currentView), name);
    view = ctx.theme.getView(path) || ctx.theme.getView(name);

    if (!view) {
      throw new Error(`Partial ${name} does not exist. (in ${currentView})`);
    }

    viewCache.set(name, view);
  }

  const { cache, only } = options;

  const viewRender = () => {
    const viewLocals = { layout: false };

    if (only) {
      Object.assign(viewLocals, locals);
    } else {
      Object.assign(viewLocals, this, locals);
    }

    // Partial don't need layout
    viewLocals.layout = false;

    return view.renderSync(viewLocals);
  };

  if (cache) {
    const cacheId = typeof cache === 'string' ? cache : view.path;

    return this.fragment_cache(cacheId, viewRender);
  }

  return viewRender();
};
