var file = require('./file'),
  yaml = require('yamljs');

var data = module.exports = new function(){
  return {
    init: function(callback){
      file.read(__dirname + '/../config.yml', function(err, file){
        if (err) throw err;

        var configs = yaml.parse(file);

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