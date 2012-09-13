var qfs = require('qfs'),
  yaml = require('js-yaml');

var data = module.exports = new function(){
  return {
    init: function(root, callback){
      qfs(root, 'config.yml').read(function(err, file){
        var configs = yaml.load(file);
        
        for (var i in configs){
          (function(i){
            data.__defineGetter__(i, function(){
              return configs[i];
            });
          })(i);
        }

        callback();
      });
    }
  }
};