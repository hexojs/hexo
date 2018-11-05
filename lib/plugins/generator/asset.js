'use strict';

const fs = require('hexo-fs');
const Promise = require('bluebird');
const { extname } = require('path');
const chalk = require('chalk');

function assetGenerator(locals) {
  const self = this;

  function process(name) {
    return Promise.filter(self.model(name).toArray(), asset => fs.exists(asset.source).tap(exist => {
      if (!exist) return asset.remove();
    })).map(asset => {
      const { source } = asset;
      let { path } = asset;
      const data = {
        modified: asset.modified
      };

      if (asset.renderable && self.render.isRenderable(path)) {
        // Replace extension name if the asset is renderable
        const ext = extname(path);
        const filename = path.substring(0, path.length - ext.length);

        path = `${filename}.${self.render.getOutput(path)}`;

        data.data = () => self.render.render({
          path: source,
          toString: true
        }).catch(err => {
          self.log.error({err}, 'Asset render failed: %s', chalk.magenta(path));
        });
      } else {
        data.data = () => fs.createReadStream(source);
      }

      return {
        path,
        data
      };
    });
  }

  return Promise.all([
    process('Asset'),
    process('PostAsset')
  ]).then(data => Reflect.apply(Array.prototype.concat, [], data));
}

module.exports = assetGenerator;
