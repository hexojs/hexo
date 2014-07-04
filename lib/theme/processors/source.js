var HexoError = require('../../error'),
  Pattern = require('../../box/pattern');

var rHiddenFile = /\/_/;

exports.process = function(data, callback){
  if (rHiddenFile.test(data.path)) return callback();

  var Asset = hexo.model('Asset'),
    source = data.source.substring(hexo.base_dir.length),
    path = data.params.path,
    doc = Asset.get(source);

  if (data.type === 'delete'){
    if (doc){
      hexo.route.remove(path);
      doc.remove();
    }

    return callback();
  }

  if (doc){
    doc.path = path;
    doc.modified = data.type === 'update';

    doc.save(function(){
      callback();
    });
  } else {
    Asset.insert({
      _id: source,
      path: path,
      modified: true
    }, function(){
      callback();
    });
  }
};

exports.pattern = new Pattern('source/*path');