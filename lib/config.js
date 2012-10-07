var fs = require('fs'),
  async = require('async'),
  yaml = require('yamljs');

module.exports = function(root, callback){
  async.parallel([
    function(next){
      fs.readFile(root + '/package.json', 'utf8', next);
    },
    function(next){
      fs.readFile(root + '/_config.yml', 'utf8', next);
    }
  ], function(err, result){
    if (err) throw err;

    var version = JSON.parse(result[0]).version,
      config = yaml.parse(result[1]);

    global.__defineGetter__('hexo', function(){
      return {
        base_dir: root + '/',
        public_dir: root + '/public/',
        source_dir: root + '/source/',
        theme_dir: root + '/themes/' + config.theme + '/',
        plugin_dir: root + '/plugins/',
        version: version,
        config: config,
        extend: require('./extend')
      }
    });

    callback();
  });
};