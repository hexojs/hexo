var HexoError = require('../../error'),
  Pattern = require('../../box/pattern');

var rHiddenFile = /\/_/;

exports.process = function(data, callback){
  if (rHiddenFile.test(data.path)) return callback();

  var Asset = hexo.model('Asset');

  Asset.updateStat(data.source.substring(hexo.base_dir.length), function(err, asset){
    if (err) return callback(HexoError.wrap(err, 'Theme source load failed: ' + data.path));

    asset.path = data.params.path;
    asset.save();
    callback();
  });
};

exports.pattern = new Pattern('source/*path');