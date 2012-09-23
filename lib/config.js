var fs = require('graceful-fs'),
  yaml = require('yamljs');

var data = module.exports = new function(){
  return {
    init: function(callback){
      fs.readFile(__dirname + '/../config.yml', 'utf8', function(err, file){
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