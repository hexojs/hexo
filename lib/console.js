var list = require('./extend').console.list(),
  clc = require('cli-color'),
  _ = require('underscore');

module.exports = function(command, args){
  var keys = Object.keys(list);

  if (_.indexOf(keys, command) === -1){
    var maxLen = 0,
      result = '\nUsage: hexo <command>\n\nCommands:\n';

    var helps = [
      ['version', 'Display version'],
      ['help', 'Display help']
    ];

    _.each(list, function(val, key){
      helps.push([key, val.description]);
    });

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
  } else {
    require('./config')(process.cwd(), function(){
      list[command](args);
    });
  }
};