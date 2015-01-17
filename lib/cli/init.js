var Hexo = require('../hexo');
var findConfig = require('./find_config');

var byeWords = [
  'Good bye',
  'See you again',
  'Farewell',
  'Have a nice day',
  'Bye!',
  'Catch you later'
];

function sayGoodbye(){
  return byeWords[(Math.random() * byeWords.length) | 0];
}

module.exports = function(args){
  var cwd = process.cwd();
  var hexo;

  findConfig(cwd, args).then(function(path){
    hexo = new Hexo(path || cwd, args);

    return hexo.init();
  }).then(function(){
    var command = args._.shift();

    if (command){
      var c = hexo.extend.console.get(command);

      if (!c || (!hexo.env.init && !c.options.init)){
        command = 'help';
      }
    } else if (args.v || args.version){
      command = 'version';
    } else {
      command = 'help';
    }

    // Listen to Ctrl+C (SIGINT) signal
    process.on('SIGINT', function(){
      hexo.log.info(sayGoodbye());

      hexo.unwatch();

      hexo.exit().then(function(){
        process.exit();
      });
    });

    return hexo.call(command, args);
  }).then(function(err){
    return hexo.exit(err);
  });
};