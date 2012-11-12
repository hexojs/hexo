var clc = require('cli-color'),
  extend = require('../extend'),
  list = extend.deployer.list();

extend.console.register('deploy', 'Deploy', function(args){
  var config = hexo.config.deploy;

  if (!config || !config.type){
    var help = '\nYou should configure deployment settings in ' + clc.bold('_config.yml') + ' first!\n\nType:\n';
    help += '  ' + Object.keys(list).join(', ');
    console.log(help + '\n\nMore info: http://zespia.tw/hexo/docs/deploy.html\n');
  } else {
    list[config.type].deploy(args);
  }
});

extend.console.register('setup_deploy', 'Setup deployment', function(args){
  var config = hexo.config.deploy;

  if (!config || !config.type){
    var help = '\nYou should configure deployment settings in ' + clc.bold('_config.yml') + ' first!\n\nType:\n';
    help += '  ' + Object.keys(list).join(', ');
    console.log(help + '\n\nMore info: http://zespia.tw/hexo/docs/deploy.html\n');
  } else {
    list[config.type].setup(args);
  }
});