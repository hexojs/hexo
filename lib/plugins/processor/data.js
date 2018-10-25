'use strict';

const { Pattern } = require('hexo-util');
const { extname } = require('path');

module.exports = ctx => ({
  pattern: new Pattern('_data/*path'),

  process: function dataProcessor(file) {
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
