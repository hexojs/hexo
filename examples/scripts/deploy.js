var spawn = require('child_process').spawn;

hexo.on('generateAfter', function(target){
  spawn('hexo', ['deploy']);
});