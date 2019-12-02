'use strict';

const { dirname, join } = require('path');

const { createHash } = require('crypto');
const md5 = (str) => createHash('md5').update(str).digest('hex');

module.exports = ctx => function partial(name, locals, options = {}) {
  if (typeof name !== 'string') throw new TypeError('name must be a string!');

  const { cache } = options;
  const viewDir = this.view_dir;
  const currentView = this.filename.substring(viewDir.length);
  const path = join(dirname(currentView), name);
  const view = ctx.theme.getView(path) || ctx.theme.getView(name);
  const viewLocals = { layout: false };

  if (!view) {
    throw new Error(`Partial ${name} does not exist. (in ${currentView})`);
  }

  if (options.only) {
    Object.assign(viewLocals, locals);
  } else {
    Object.assign(viewLocals, this, locals);
  }

  // Partial don't need layout
  viewLocals.layout = false;

  if (cache) {
    // fragment_cache for the partial is enabled no matter if enhance_cache is enabled
    /*
     * The specific { cache: true } or { cache: cacheId } should have higher priority.
     * It means theme developer want to cache this partial even the locals has changed.
     */
    const cacheId = typeof cache === 'string' ? cache : view.path;

    return this.fragment_cache(cacheId, () => view.renderSync(viewLocals));
  } else if (ctx.config.enhance_cache && cache !== false) {
    // enhance_cache is enabled while fragment_cache for the partial is not disabled
    /*
     * If a theme developer doesn't want caching, they might use { cache: false }.
     * We should stick to current behavior even if user has enabled enhance_cache.
     */
    const cacheId = typeof cache === 'string' ? cache : [view.path, md5(JSON.stringify(viewLocals))].join('-');

    return this.fragment_cache(cacheId, () => view.renderSync(viewLocals));
  }

  // render directly since neither enhance_cache & fragment_cache is enabled.
  return view.renderSync(viewLocals);
};
