var colors = require('colors'),
  extend = require('../extend'),
  list = extend.deployer.list(),
  util = require('../util'),
  spawn = util.spawn;

extend.console.register('deploy', 'Deploy', function(args){
  var config = hexo.config.deploy;

  if (!config || !config.type){
    var help = '\nYou should configure deployment settings in ' + '_config.yml'.bold + ' first!\n\nType:\n';
    help += '  ' + Object.keys(list).join(', ');
    console.log(help + '\n\nMore info: http://zespia.tw/hexo/docs/deploy.html\n');
  } else {
    if (args.generate){
      spawn({
        command: 'hexo',
        args: ['generate'],
        exit: function(code){
          if (code === 0) list[config.type].deploy(args);
        }
      });
    } else {
      list[config.type].deploy(args);
    }
  }
});