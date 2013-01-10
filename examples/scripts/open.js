var spawn = require('child_process').spawn;

hexo.on('new', function(target){
  spawn('open', [target]);
});