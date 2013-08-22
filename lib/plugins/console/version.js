var _ = require('lodash');

module.exports = function(args, callback){
  var versions = _.extend({
    hexo: hexo.version,
    os: process.platform + ' ' + process.arch
  }, process.versions);

  if (args.json){
    console.log(versions);
  } else {
    var result = [];

    for (var i in versions){
      result.push(i + ': ' + versions[i]);
    }

    console.log(result.join('\n'));
  }

  callback();
};