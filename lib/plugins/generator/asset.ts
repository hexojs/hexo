import { exists, createReadStream } from 'hexo-fs';
import { promiseFilter, promiseMap } from '../../util/promise';
import { extname } from 'path';
import { magenta } from 'picocolors';
import type Hexo from '../../hexo';
import type { AssetSchema, BaseGeneratorReturn } from '../../types';
import type Document from 'warehouse/dist/document';

interface AssetData {
  modified: boolean;
  data?: () => any;
}

interface AssetGenerator extends BaseGeneratorReturn {
  data: {
    modified: boolean;
    data?: () => any;
  }
}

const process = (name: string, ctx: Hexo) => {
  return promiseFilter(ctx.model(name).toArray(), (asset: Document<AssetSchema>) => Promise.resolve(exists(asset.source)).then(async exist => {
    if (!exist) await asset.remove();
    return exist;
  })).then(assets => promiseMap(assets, (asset: Document<AssetSchema>) => {
    const { source } = asset;
    let { path } = asset;
    const data: AssetData = {
      modified: asset.modified
    };

    if (asset.renderable && ctx.render.isRenderable(path)) {
      // Replace extension name if the asset is renderable
      const filename = path.substring(0, path.length - extname(path).length);

      path = `${filename}.${ctx.render.getOutput(path)}`;

      data.data = () => ctx.render.render({
        path: source,
        toString: true
      }).catch((err: Error) => {
        ctx.log.error({err}, 'Asset render failed: %s', magenta(path));
      });
    } else {
      data.data = () => createReadStream(source);
    }

    return { path, data };
  }));
};

function assetGenerator(this: Hexo): Promise<AssetGenerator[]> {
  return Promise.all([
    process('Asset', this),
    process('PostAsset', this)
  ]).then(data => [].concat(...data));
}

export = assetGenerator;
