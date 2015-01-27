'use strict';

var util = require('hexo-util');
var pathFn = require('path');
var Pattern = util.Pattern;

exports.process = function(file){
  if (this.render.getOutput(file.path) !== 'json') return;

  var Data = this.model('Data');
  var path = file.params.path;
  var extname = pathFn.extname(path);
  var id = path.substring(0, path.length - extname.length);
  var doc = Data.findById(id);

  if (file.type === 'skip' && doc){
    return;
  }

  if (file.type === 'delete'){
    if (doc){
      return doc.remove();
    } else {
      return;
    }
  }

  return file.render().then(function(result){
    if (typeof result !== 'object') return;

    if (doc){
      doc.data = result;

      return doc.save();
    } else {
      return Data.insert({
        _id: id,
        data: result
      });
    }
  });
};

exports.pattern = new Pattern('_data/*path');