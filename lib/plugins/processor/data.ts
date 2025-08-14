import { Pattern } from 'hexo-util';
import { extname } from 'path';
import type Hexo from '../../hexo/index.js';
import type { _File } from '../../box/index.js';

const dataProcessor = (ctx: Hexo) => ({
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

export default dataProcessor;
if (typeof module !== 'undefined' && typeof module.exports === 'object' && module.exports !== null) {
  module.exports = dataProcessor;
  module.exports.default = dataProcessor;
}
