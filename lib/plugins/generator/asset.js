'use strict';

const fs = require('hexo-fs');
const Promise = require('bluebird');
const { extname } = require('path');
const chalk = require('chalk');

const process = (name, ctx) => {
  return Promise.filter(ctx.model(name).toArray(), asset => fs.exists(asset.source).tap(exist => {
    if (!exist) return asset.remove();
  })).map(asset => {
    const { source } = asset;
    let { path } = asset;
    const data = {
      modified: asset.modified
    };

    if (asset.renderable && ctx.render.isRenderable(path)) {
      // Replace extension name if the asset is renderable
      const filename = path.substring(0, path.length - extname(path).length);

      path = `${filename}.${ctx.render.getOutput(path)}`;

      data.data = () => ctx.render.render({
        path: source,
        toString: true
      }).catch(err => {
        ctx.log.error({err}, 'Asset render failed: %s', chalk.magenta(path));
      });
    } else {
      data.data = () => fs.createReadStream(source);
    }

    return { path, data };
  });
};

function assetGenerator(locals) {
  return Promise.all([
    process('Asset', this),
    process('PostAsset', this)
  ]).then(data => [].concat(...data));
}

module.exports = assetGenerator;
