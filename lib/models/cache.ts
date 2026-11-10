import warehouse from 'warehouse';
import type Hexo from '../hexo';
import type fs from 'fs';
import type Document from 'warehouse/dist/document';
import type { CacheSchema } from '../types';

export = (_ctx: Hexo) => {
  const Cache = new warehouse.Schema<CacheSchema>({
    _id: {type: String, required: true},
    hash: {type: String, default: ''},
    modified: {type: Number, default: Date.now() } // UnixTime
  });

  Cache.static('compareFile', function(id: string,
    hashFn: (id: string) => PromiseLike<string>,
    statFn: (id: string) => PromiseLike<fs.Stats>): Promise<{ type: string }> {
    const cache = this.findById(id) as Document<CacheSchema>;

    // If cache does not exist, then it must be a new file. We have to get both
    // file hash and stats.
    if (!cache) {
      return Promise.all([hashFn(id), statFn(id)]).then(([hash, stats]) => this.insert({
        _id: id,
        hash,
        modified: stats.mtime.getTime()
      })).then(() => ({
        type: 'create'
      }));
    }

    let mtime: number;

    // Get file stats
    return Promise.resolve(statFn(id)).then<any>(stats => {
      mtime = stats.mtime.getTime();

      // Skip the file if the modified time is unchanged
      if (cache.modified === mtime) {
        return {
          type: 'skip'
        };
      }

      // Get file hash
      return hashFn(id);
    }).then((result: string | { type: string }) => {
      // If the result is an object, skip the following steps because it's an
      // unchanged file
      if (typeof result === 'object') return result;

      const hash = result;

      // The content is unchanged, but persist the new mtime so subsequent scans
      // can skip hashing.
      if (cache.hash === hash) {
        cache.modified = mtime;

        return cache.save().then(() => ({
          type: 'skip'
        }));
      }

      // Update cache info
      cache.hash = hash;
      cache.modified = mtime;

      return cache.save().then(() => ({
        type: 'update'
      }));
    });
  });

  return Cache;
};
