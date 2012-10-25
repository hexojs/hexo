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
      config = yaml.parse(result[1]);

    global.__defineGetter__('hexo', function(){
      return {
        base_dir: root + sep,
        public_dir: root + sep + 'public' + sep,
        source_dir: root + sep + 'source' + sep,
        theme_dir: root + sep + 'themes' + sep + config.theme + sep,
        plugin_dir: root + sep + 'node_modules' + sep,
        version: version,
        config: config,
        extend: require('./extend'),
        util: require('./util')
      }
    });

    callback();
  });
};