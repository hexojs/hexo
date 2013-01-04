var clc = require('cli-color'),
  async = require('async'),
  fs = require('graceful-fs'),
  extend = require('../extend'),
  util = require('../util'),
  format = require('util').format,
  spawn = util.spawn,
  gConfig = hexo.config,
  defaultRoot = '~/' + gConfig.url.replace(/^https?:\/\//, '') + '/';

var displayHelp = function(){
  var help = [
    'Example:',
    '  deploy:',
    '    type: rsync',
    '    host: <host>',
    '    user: <user>',
    '    root: [root] # Default is ' + defaultRoot,
    '    port: [port] # Default is 22',
    '    delete: [delete] # Default is true',
    '',
    'More info: http://zespia.tw/hexo/docs/deploy.html',
  ];

  console.log(help.join('\n') + '\n');
};

var rsync = require("./rsyncwrapper").rsync;

var deploy = function(){
  var config = gConfig.deploy;

  if (!config.host || !config.user){
    console.log('\nYou should configure deployment settings in %s first!\n', clc.bold('_config.yml'));
    return displayHelp();
  }
  if (!config.hasOwnProperty('delete')) config.delete = true;
  if (!config.port) config.port = 22;
  if (!config.root) config.root = defaultRoot;

  async.waterfall([
    // Check if public exists or not
    function(next){
      fs.exists(hexo.public_dir, function(exist){
        if (exist) next();
        else console.log('You have to use %s to generate files first.', clc.bold('hexo generate'));
      });
    },
    function(next){
      fs.exists(hexo.base_dir + 'rsync-exclude', function(exist){
        next(null, exist);
      });
    },
    function(exist, next){
      //var exclude = exist ? '--exclude-from ' + hexo.base_dir + 'rsync-exclude ' : '',
      //comm = format('%s%s%s public/ %s@%s:%s' , (config.port ? '' : "'ssh -p "+ config.port +"' ") , exclude, (config.delete ? '--delete' : ''), config.user , config.host ,  config.root);
      //console.log('Syncing.  rsync -avz ' + comm + '');
      //command('rsync', ['-avz', '-e' , '"' + comm + '"']);      
		rsync(
			{
				src: "public/",
				host: config.user+'@'+config.host,
				dest: config.root,
				recursive: true,
				syncDest: true
			},function (error,stdout,stderr,cmd) {
			if ( error ) {
				// failed
				console.log(error.message);
			} else {
				// success
				console.log('Deploy successful.');
			}
		});
      
    }
  ], function(){
    console.log('Deploy complete.');
  });
};

var setup = function(){
  console.log('\nNo need to setup for rsync deployment. Just configure deployment settings in %s and run %s.\n', clc.bold('_config.yml'), clc.bold('hexo deploy'));
  displayHelp();
};

extend.deployer.register('rsync', {
  deploy: deploy,
  setup: setup
});