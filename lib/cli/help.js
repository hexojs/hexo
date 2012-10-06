var clc = require('cli-color'),
  _ = require('underscore');

module.exports = function(){
  var maxLen = 0,
    result = '\nUsage: hexo <command>\n\nOptions:\n';
    
  var helps = [
    ['-v, version', 'Display version'],
    ['help', 'Display help'],
    ['init', 'Initialize'],
    ['server', 'Run server'],
    ['generate', 'Generate static files'],
    ['deploy', 'Deploy'],
    ['setup_deploy', 'Setup deploy'],
    ['new_post', 'Create new post'],
    ['new_page', 'Create new page']
  ];

  _.each(helps, function(item){
    var length = item[0].length;
    if (maxLen < length) maxLen = length;
  });

  _.each(helps, function(item){
    result += '  ' + clc.bold(item[0]);

    for (var i=0; i<maxLen + 3 - item[0].length; i++){
      result += ' ';
    }

    result += item[1] + '\n';
  });

  console.log(result);
};