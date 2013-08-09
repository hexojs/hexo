var path = require('path'),
  async = require('async'),
  moment = require('moment'),
  fs = require('graceful-fs'),
  sprintf = require('sprintf-js').sprintf,
  HexoError = require('../../error'),
  util = require('../../util'),
  file = util.file2;

module.exports = function(args, callback){
  var target = hexo.base_dir,
    coreDir = hexo.core_dir,
    log = hexo.log;

  if (args._[0]) target = path.resolve(target, args._[0]);

  async.auto({
    // Check if target has initialized
    check: function(next){
      fs.exists(path.join(target + '_config.yml'), function(exist){
        if (exist){
          log.w('This folder has been already initialized.');
          return callback();
        }

        next();
      });
    },
    // Copy theme data
    theme: ['check', function(next){
      log.i('Copying theme data...');

      file.copyDir(path.join(coreDir, 'assets/themes/light'), path.join(target, 'themes/light'), function(err){
        if (err) return callback(HexoError.wrap(err, 'Theme copy failed'));

        log.d('Theme data copied');
        next();
      });
    }],
    // Create blank folders
    create_folders: ['check', function(next){
      var folders = [
        'source/_drafts',
        'scripts'
      ];

      async.forEach(folders, function(folder, next){
        log.i('Creating folder: ' + folder);

        file.mkdirs(path.join(target, folder), function(err){
          if (err) return callback(HexoError.wrap(err, 'Folder create failed: ' + folder));

          log.d('Folder created: ' + folder);
          next();
        })
      }, next);
    }],
    // Copy files
    copy: ['check', function(next){
      var files = [
        '_config.yml',
        'scaffolds/page.md',
        'scaffolds/photo.md',
        'scaffolds/post.md'
      ];

      async.forEach(files, function(item, next){
        log.i('Copying file: ' + item);

        file.copyFile(path.join(coreDir, 'assets/init/' + item), path.join(target, item), function(err){
          if (err) return callback(HexoError.wrap(err, 'File copy failed: ' + item));

          log.d('File copied: ' + item);
          next();
        });
      }, next);
    }],
    // Create .gitignore
    gitignore: ['check', function(next){
      var content = [
        '.DS_Store',
        'node_modules',
        'db.json'
      ];

      log.i('Creating file: .gitignore');

      file.writeFile(path.join(target, '.gitignore'), content.join('\n'), function(err){
        if (err) return callback(HexoError.wrap(err, 'File create failed: .gitignore'));

        log.d('File created: .gitignore');
        next();
      });
    }],
    // Create package.json
    package_json: ['check', function(next){
      var content = {
        name: 'hexo',
        version: hexo.version,
        private: true,
        dependencies: {}
      };

      log.i('Creating file: package.json');

      file.writeFile(path.join(target, 'package.json'), JSON.stringify(content, null, '  '), function(err){
        if (err) return callback(HexoError.wrap(err, 'File create failed: package.json'));

        log.d('File created: package.json');
        next();
      });
    }],
    // Create hello-world.md
    hello_world: ['check', function(next){
      log.i('Creating file: source/_posts/hello-world.md');

      file.readFile(coreDir + 'assets/init/hello-world.md', function(err, content){
        if (err) return callback(HexoError.wrap(err, 'File read failed: source/_posts/hello-world.md'));

        //content = content.replace('%date%', moment().format('YYYY-MM-DD HH:mm:ss'));
        content = sprintf('content', {
          date: moment().format('YYYY-MM-DD HH:mm:ss')
        });

        file.writeFile(path.join(target, 'source/_posts/hello-world.md'), content, function(err){
          if (err) return callback(HexoError.wrap(err, 'File create failed: source/_posts/hello-world.md'));

          log.d('File created: source/_posts/hello-world.md');
          next();
        });
      });
    }]
  }, function(err){
    if (err) return callback(HexoError.wrap(err, 'Initialize failed'));

    log.i('Initialization has been done. Start blogging with Hexo!');
    callback();
  });
};