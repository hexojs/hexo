var Mocha = require('mocha'),
  path = require('path'),
  argv = require('optimist').argv;

var tests = [
  'i18n',
  'log',
  'router',
  'tag'
];

var mocha = new Mocha({
  reporter: argv.reporter || 'dot'
});

require('../lib/init')(path.join(__dirname, 'blog'), {_: [], test: true}, function(){
  tests.forEach(function(item){
    mocha.addFile(path.join(__dirname, item + '.js'));
  });

  mocha.run(function(failures){
    process.exit(failures);
  });
});