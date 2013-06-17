var path = require('path'),
  async = require('async'),
  term = require('term'),
  moment = require('moment'),
  fs = require('graceful-fs'),
  extend = require('../../extend'),
  util = require('../../util'),
  file = util.file2,
  coreDir = hexo.core_dir,
  log = hexo.log;

var throwErr = function(err, msg, next){
  var stack = err.stack;

  err.name = 'Error';
  err.message = msg;
  err.stack = stack;

  log.e(err);
  next();
};

extend.console.register('init', 'Initialize', {init: true}, function(args, callback){
  var target = process.cwd();

  if (args._[0]) target = path.resolve(target, args._[0]);

  async.auto({
    // Check if target has initialized
    check: function(next){
      fs.exists(target + '/_config.yml', function(exist){
        if (!exist){
          log.i('Start initializing...');
          next();
        } else {
          log.e('Your blog has been already initialized.')
        }
      });
    },
    // Create target folder
    target: ['check', function(next){
      fs.exists(target, function(exist){
        if (exist) return next();

        file.mkdirs(target, function(err){
          if (err) throw throwErr(err, 'Target folder create failed', next);

          next();
        });
      });
    }],
    theme: ['target', function(next){
      file.copyDir(coreDir + 'assets/themes/light', target + '/themes/light', function(err){
        if (err) throw throwErr(err, 'Theme copy failed', next);

        next();
      });
    }],
    create_folders: ['target', function(next){
      var folders = [
        'source/_posts',
        'source/_drafts',
        'scripts',
        'scaffolds'
      ];

      async.forEach(folders, function(folder, next){
        file.mkdirs(target + '/' + folder, function(err){
          if (err) throw throwErr(err, folder + ' folder create failed', next);

          next();
        });
      }, next);
    }],
    copy: ['create_folders', function(next){
      var files = [
        '_config.yml',
        'scaffolds/page.md',
        'scaffolds/photo.md',
        'scaffolds/post.md'
      ];

      async.forEach(files, function(f, next){
        file.copyFile(coreDir + 'assets/init/' + f, target + '/' + f, function(err){
          if (err) throw throwErr(err, f + ' copy failed', next);

          next();
        });
      }, next);
    }],
    gitignore: ['target', function(next){
      var content = [
        '.DS_Store',
        'node_modules',
        'db.json'
      ];

      fs.writeFile(target + '/.gitignore', content.join('\n'), function(err){
        if (err) throw throwErr(err, '.gitignore write failed', next);

        next();
      });
    }],
    package_json: ['target', function(next){
      var content = {
        name: 'hexo',
        version: hexo.version,
        private: true,
        dependencies: {}
      };

      fs.writeFile(target + '/package.json', JSON.stringify(content, null, '  '), function(err){
        if (err) throw throwErr(err, 'package.json write failed', next);

        next();
      });
    }],
    hello_world: ['create_folders', function(next){
      file.readFile(coreDir + 'assets/init/hello-world.md', function(err, content){
        if (err) throw throwErr(err, 'hello-world.md read failed', next);

        content = content.replace('%date%', moment().format('YYYY-MM-DD HH:mm:ss'));

        file.writeFile(target + '/source/_posts/hello-world.md', content, function(err){
          if (err) throw throwErr(err, 'source/_posts/hello-world.md write failed', next);

          next();
        });
      });
    }]
  }, function(err){
    if (err) return file.rmdir(target);

    log.i('Initialization has been done. Start blogging with Hexo!');
  });
});
