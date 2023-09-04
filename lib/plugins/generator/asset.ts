/* eslint-disable @typescript-eslint/ban-ts-comment */
import { exists, createReadStream } from 'hexo-fs';
import Promise from 'bluebird';
import { extname } from 'path';
import { magenta } from 'picocolors';
import type warehouse from 'warehouse';
import type Hexo from '../../hexo';

interface Data {
  modified: boolean;
  data?: () => any;
}

const process = (name: string, ctx: Hexo) => {
  // @ts-expect-error
  return Promise.filter(ctx.model(name).toArray(), (asset: warehouse['Schema']) => exists(asset.source).tap(exist => {
    // @ts-expect-error
    if (!exist) return asset.remove();
  })).map((asset: warehouse['Schema']) => {
    // @ts-expect-error
    const { source } = asset;
    // @ts-expect-error
    let { path } = asset;
    const data: Data = {
      // @ts-expect-error
      modified: asset.modified
    };

    // @ts-expect-error
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
      data.data = () => createReadStream(source);
    }

    return { path, data };
  });
};

function assetGenerator(this: Hexo): Promise<any[]> {
  return Promise.all([
    process('Asset', this),
    process('PostAsset', this)
  ]).then(data => [].concat(...data));
}

export = assetGenerator;
