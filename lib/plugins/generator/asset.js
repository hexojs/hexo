'use strict';

const fs = require('hexo-fs');
const Promise = require('bluebird');
const { extname } = require('path');
const chalk = require('chalk');

function assetGenerator(locals) {
  const process = name => {
    return Promise.filter(this.model(name).toArray(), asset => fs.exists(asset.source).then(exist => {
      if (exist) return exist;
      return asset.remove().thenReturn(exist);
    })).map(asset => {
      const { source } = asset;
      let { path } = asset;
      const data = {
        modified: asset.modified
      };

      if (asset.renderable && this.render.isRenderable(path)) {
        // Replace extension name if the asset is renderable
        const ext = extname(path);
        const filename = path.substring(0, path.length - ext.length);

        path = `${filename}.${this.render.getOutput(path)}`;

        data.data = () => this.render.render({
          path: source,
          toString: true
        }).catch(err => {
          this.log.error({err}, 'Asset render failed: %s', chalk.magenta(path));
        });
      } else {
        data.data = () => fs.createReadStream(source);
      }

      return {
        path,
        data
      };
    });
  };

  return Promise.all([
    process('Asset'),
    process('PostAsset')
  ]).then(data => Reflect.apply(Array.prototype.concat, [], data));
}

module.exports = assetGenerator;
