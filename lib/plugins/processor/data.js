'use strict';

var util = require('hexo-util');
var pathFn = require('path');
var Pattern = util.Pattern;

module.exports = function(ctx) {
  return {
    pattern: new Pattern('_data/*path'),
    process: function dataProcessor(file) {
      var Data = ctx.model('Data');
      var path = file.params.path;
      var extname = pathFn.extname(path);
      var id = path.substring(0, path.length - extname.length);
      var doc = Data.findById(id);

      if (file.type === 'skip' && doc) {
        return;
      }

      if (file.type === 'delete') {
        if (doc) {
          return doc.remove();
        }

        return;
      }

      return file.render().then(function(result) {
        if (result == null) return;

        return Data.save({
          _id: id,
          data: result
        });
      });
    }
  };
};
