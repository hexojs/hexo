'use strict';

var util = require('hexo-util');
var pathFn = require('path');
var Pattern = util.Pattern;

exports.process = function(file) {
  var Data = this.model('Data');
  var path = file.params.path;
  var extname = pathFn.extname(path);
  var id = path.substring(0, path.length - extname.length);
  var doc = Data.findById(id);

  if (file.type === 'delete') {
    if (doc) {
      return doc.remove();
    }

    return;
  }

  return file.changed().then(function(changed) {
    if (!changed && doc) return;

    return file.render();
  }).then(function(result) {
    if (result == null) return;

    return Data.save({
      _id: id,
      data: result
    });
  });
};

exports.pattern = new Pattern('_data/*path');
