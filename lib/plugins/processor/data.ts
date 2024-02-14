import { Pattern } from 'hexo-util';
import { extname } from 'path';
import type Hexo from '../../hexo';
import type { _File } from '../../box';

export = (ctx: Hexo) => ({
  pattern: new Pattern('_data/*path'),

  process: function dataProcessor(file: _File) {
    const Data = ctx.model('Data');
    const { path } = file.params;
    const id = path.substring(0, path.length - extname(path).length);
    const doc = Data.findById(id);

    if (file.type === 'skip' && doc) {
      return;
    }

    if (file.type === 'delete') {
      if (doc) {
        return doc.remove();
      }

      return;
    }

    return file.render().then(result => {
      if (result == null) return;

      return Data.save({
        _id: id,
        data: result
      });
    });
  }
});
