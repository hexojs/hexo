var Mocha = require('mocha'),
  path = require('path'),
  fs = require('graceful-fs'),
  argv = require('optimist').argv;

var mocha = new Mocha({
  reporter: argv.reporter || 'dot'
});

var rFilename = /\.test\.js$/;

fs.readdir(__dirname, function(err, files){
  files.forEach(function(item){
    if (rFilename.test(item)){
      mocha.addFile(path.join(__dirname, item));
    }
  });

  require('../lib/init')(path.join(__dirname, 'blog'), {_: [], _test: true}, function(){
    mocha.run(function(failures){
      process.exit(failures);
    });
  });
});