var spawn = require('child_process').spawn;

hexo.on('generateAfter', function(){
  spawn('hexo', ['deploy']);
});