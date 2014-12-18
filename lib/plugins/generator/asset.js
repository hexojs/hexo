var fs = require('hexo-fs');
var Promise = require('bluebird');

module.exports = function(locals, render){
  var route = this.route;
  var self = this;

  function process(name){
    return Promise.filter(self.model(name).toArray(), function(asset){
      return fs.exists(asset.source).then(function(exist){
        if (exist) return true;
        return asset.remove().thenReturn(false);
      });
    }).each(function(asset){
      var source = asset.source;

      function content(fn){
        fn(null, fs.createReadStream(source));
      }

      content.modified = asset.modified;
      route.set(asset.path, content);
    });
  }

  return Promise.all([
    process('Asset'),
    process('PostAsset')
  ]);
};