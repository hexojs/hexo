var fs = require('fs'),
  async = require('async'),
  yaml = require('yamljs'),
  sep = require('path').sep;

module.exports = function(root, callback){
  async.parallel([
    function(next){
      fs.readFile(__dirname + '/../package.json', 'utf8', next);
    },
    function(next){
      fs.exists(root + '/_config.yml', function(exist){
        if (exist){
          fs.readFile(root + '/_config.yml', 'utf8', next);
        } else {
          next(null, '');
        }
      });
    }
  ], function(err, result){
    if (err) throw err;

    var version = JSON.parse(result[0]).version,
      config = yaml.parse(result[1]),
      env = process.env,
      themeDir = config ? root + sep + 'themes' + sep + config.theme + sep : null;

    global.hexo = {
      get base_dir(){return root + sep},
      get public_dir(){return root + sep + 'public' + sep},
      get source_dir(){return root + sep + 'source' + sep},
      get theme_dir(){return themeDir},
      get plugin_dir(){return root + sep + 'node_modules' + sep},
      get version(){return version},
      get env(){return env},
      get config(){return config},
      get extend(){return require('./extend')},
      get util(){return require('./util')},
      get render(){return require('./render')}
    };

    require('./renderer');
    require('./tag');
    require('./deployer');
    require('./processor');
    require('./helper');
    require('./generator');

    callback();
  });
};