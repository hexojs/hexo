var Mocha = require('mocha'),
  path = require('path');

module.exports = function(grunt){
  grunt.registerMultiTask('test', function(){
    var done = this.async(),
      options = this.options();

    var mocha = new Mocha(options);

    this.files.forEach(function(file){
      file.src.forEach(function(src){
        mocha.addFile(src);
      });
    });

    require('../lib/init')(path.join(path.dirname(__dirname), 'test', 'blog'), {
      _: [],
      silent: true,
      debug: true
    }, function(){
      mocha.run(function(failures){
        done(failures);
      });
    });
  });
};