var path = require('path'),
  async = require('async'),
  term = require('term'),
  moment = require('moment'),
  extend = require('../../extend'),
  util = require('../../util'),
  file = util.file,
  coreDir = hexo.core_dir;

extend.console.register('init', 'Initialize', {init: true}, function(args, callback){
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
    draft_folder: ['source', function(next){
      file.mkdir(target + '/source/_drafts', next);
    }],
    script_folder: function(next){
      file.mkdir(target + '/scripts', next);
    },
    public_folder: function(next){
      file.mkdir(target + '/public', next);
    },
    // Copy files
    copy: function(next){
      var files = ['package.json', '_config.yml', 'scaffolds/post.md', 'scaffolds/page.md', 'scaffolds/photo.md'];
      async.forEach(files, function(item, next){
        file.copy(coreDir + 'files/init/' + item, target + '/' + item, next);
      }, next);
    },
    gitignore: function(next){
      file.copy(coreDir + 'files/init/gitignore', target + '/.gitignore', next);
    },
    // Create a Hello World post
    post: [function(next){
      file.read(coreDir + 'files/init/hello-world.md', function(err, content){
        if (err) throw new Error('File not found: hello-world.md');
        content = content.replace('%date%', moment().format('YYYY-MM-DD HH:mm:ss'));
        file.write(target + '/source/_posts/hello-world.md', content, next);
      });
    }]
  }, function(){
    console.log('Hexo is setup at %s.', target.bold);
    callback();
  });
});
