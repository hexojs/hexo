var async = require('async'),
  clc = require('cli-color'),
  _ = require('underscore');

module.exports = function(command, args){
  async.series([
    function(next){
      require('./config')(process.cwd(), next);
    },
    function(next){
      require('./loader')(next);
    }
  ], function(){
    var list = require('./extend').console.list(),
      keys = Object.keys(list);

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

      helps = helps.sort(function(a, b){
        var orderA = a[0],
          orderB = b[0];

        if (orderA.length >= orderB.length) maxLen = orderA.length;
        else maxLen = orderB.length;

        if (orderA < orderB) return -1;
        else if (orderA > orderB) return 1;
        else return 0;
      });

      _.each(helps, function(item){
        result += '  ' + clc.bold(item[0]);

        for (var i=0; i<maxLen + 3 - item[0].length; i++){
          result += ' ';
        }

        result += item[1] + '\n';
      });

      result += '\nMore info: http://zespia.tw/hexo/docs/cli.html\n';

      console.log(result);
    } else {
      list[command](args);
    }
  });
};