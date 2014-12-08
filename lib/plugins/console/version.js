var _ = require('lodash');
var os = require('os');

module.exports = function(args){
  var versions = _.extend({
    hexo: this.version,
    os: os.type() + ' ' + os.release() + ' ' + os.platform() + ' ' + os.arch()
  }, process.versions);

  if (args.json){
    console.log(versions);
  } else {
    for (var i in versions){
      console.log(i + ': ' + versions[i]);
    }
  }
};