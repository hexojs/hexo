var fs = require('hexo-fs');
var Promise = require('bluebird');

function assetGenerator(locals){
  var self = this;

  function process(name){
    return Promise.filter(self.model(name).toArray(), function(asset){
      return fs.exists(asset.source).then(function(exist){
        if (exist) return exist;
        return asset.remove().thenReturn(exist);
      });
    }).map(function(asset){
      var source = asset.source;
      var data = function(){
        return fs.createReadStream(source);
      };

      data.modified = asset.modified;

      return {
        path: asset.path,
        data: data
      };
    });
  }

  return Promise.all([
    process('Asset'),
    process('PostAsset')
  ]).then(function(data){
    return Array.prototype.concat.apply([], data);
  });
}

module.exports = assetGenerator;