var path = require('path'),
  async = require('async'),
  colors = require('colors'),
  moment = require('moment'),
  extend = require('../extend'),
  util = require('../util'),
  file = util.file,
  coreDir = hexo.core_dir;

extend.console.register('init', 'Initialize', {init: true}, function(args){
  var target = process.cwd();

  if (args._[0]) target = path.resolve(target, args._[0]);

  console.log('Initializing.');

  async.auto({
    // Install theme
    theme: function(next){
      var themeDir = coreDir + 'files/themes/light/';

      file.dir(themeDir, function(files){
        async.forEach(files, function(item, next){
          file.copy(themeDir + item, target + '/themes/light/' + item, next);
        }, next);
      });
    },
    // Create folders
    source: function(next){
      file.mkdir(target + '/source', next);
    },
    post_folder: ['source', function(next){
      file.mkdir(target + '/source/_posts', next);
    }],
    draft_folder: ['source', function(next){
      file.mkdir(target + '/source/_drafts', next);
    }],
    script_folder: function(next){
      file.mkdir(target + '/scripts', next);
    },
    public_folder: function(next){
      file.mkdir(target + '/public', next);
    },
    scaffold_folder: function(next){
      file.mkdir(target + '/scaffolds', next);
    },
    // Create package.json
    package: function(next){
      file.copy(coreDir + 'files/init/package.json', target + '/package.json', next);
    },
    // Create .gitignore
    gitignore: function(next){
      file.copy(coreDir + 'files/init/.gitignore', target + '/.gitignore', next);
    },
    // Create config file
    config: function(next){
      file.copy(coreDir + 'files/init/_config.yml', target + '/_config.yml', next);
    },
    // Create a Hello World post
    post: ['post_folder', function(next){
      file.read(coreDir + 'files/init/hello-world.md', function(err, content){
        if (err) throw new Error('File not found: hello-world.md');
        content = content.replace('%date%', moment().format('YYYY-MM-DD HH:mm:ss'));
        file.write(target + '/source/_posts/hello-world.md', content, next);
      });
    }]
  }, function(){
    console.log('Hexo is setup at %s.', target.bold);
  });
});
