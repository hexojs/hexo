import fs from 'hexo-fs';
import Promise from 'bluebird';
import {extname} from 'path';
import { magenta } from 'picocolors';
import warehouse from 'warehouse';

interface Data {
  modified: boolean;
  data?: () => any;
}

const process = (name, ctx) => {
  return Promise.filter(ctx.model(name).toArray(), (asset: warehouse.Schema) => fs.exists(asset.source).tap(exist => {
    if (!exist) return asset.remove();
  })).map((asset: warehouse.Schema) => {
    const { source } = asset;
    let { path } = asset;
    const data: Data = {
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
        ctx.log.error({err}, 'Asset render failed: %s', magenta(path));
      });
    } else {
      data.data = () => fs.createReadStream(source);
    }

    return { path, data };
  });
};

function assetGenerator() {
  return Promise.all([
    process('Asset', this),
    process('PostAsset', this)
  ]).then(data => [].concat(...data));
}

export = assetGenerator;
