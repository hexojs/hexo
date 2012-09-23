var clc = require('cli-color');

module.exports = function(){
  var maxLen = 0,
    result = '\nUsage: writer <command>\n\nOptions:\n';
    
  var helps = [
    ['-v, --version', 'Display version'],
    ['help', 'Display help'],
    ['init', 'Initalize'],
    ['server', 'Run server'],
    ['generate', 'Generate static files'],
    ['deploy', 'Deploy']
  ];

  helps.forEach(function(val){
    var length = val[0].length;
    if (maxLen < length) maxLen = length;
  });

  helps.forEach(function(val){
    result += '  ' + clc.bold(val[0]);

    for (var i=0; i<maxLen + 3 - val[0].length; i++){
      result += ' ';
    }

    result += val[1] + '\n';
  });

  console.log(result);
};