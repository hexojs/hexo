var async = require('async'),
  fs = require('graceful-fs'),
  path = require('path'),
  term = require('term'),
  _ = require('lodash'),
  EventEmitter = require('events').EventEmitter,
  Database = require('warehouse'),
  call = require('./call'),
  extend = require('./extend'),
  i18n = require('./i18n'),
  render = require('./render'),
  route = require('./route'),
  util = require('./util');

var defaults = {
  // Site
  title: 'Hexo',
  subtitle: '',
  description: '',
  author: 'John Doe',
  email: '',
  language: '',
  // URL
  url: 'http://yoursite.com',
  root: '/',
  permalink: ':year/:month/:day/:title/',
  tag_dir: 'tags',
  archive_dir: 'archives',
  category_dir: 'categories',
  // Writing
  new_post_name: ':title.md',
  default_layout: 'post',
  auto_spacing: false,
  titlecase: false,
  max_open_file: 100,
  filename_case: 0,
  highlight: {
    enable: true,
    backtick_code_block: true,
    line_number: true,
    tab_replace: '',
  },
  // Category & Tag
  default_category: 'uncategorized',
  category_map: {},
  tag_map: {},
  // Archives
  archive: 2,
  category: 2,
  tag: 2,
  // Server
  port: 4000,
  logger: false,
  logger_format: '',
  // Date / Time format
  date_format: 'MMM D YYYY',
  time_format: 'H:mm:ss',
  // Pagination
  per_page: 10,
  pagination_dir: 'page',
  // Disqus
  disqus_shortname: '',
  // Extensions
  theme: 'light',
  exclude_generator: [],
  // Deployment
  deploy: {}
};

module.exports = function(args){
  var safe = args.safe ? true : false,
    debug = args.debug ? true : false,
    dirname = __dirname,
    baseDir = process.cwd() + '/',
    db = new Database(baseDir + 'db.json'),
    version = require('../package.json').version,
    config = {};

  var hexo = global.hexo = {
    get base_dir(){return baseDir},
    get public_dir(){return baseDir + 'public/'},
    get source_dir(){return baseDir + 'source/'},
    get theme_dir(){return baseDir + 'themes/' + config.theme + '/'},
    get plugin_dir(){return baseDir + 'node_modules/'},
    get script_dir(){return baseDir + 'scripts/'},
    get scaffold_dir(){return baseDir + 'scaffolds/'},
    get core_dir(){return path.dirname(dirname) + '/'},
    get lib_dir(){return dirname + '/'},
    get version(){return version},
    get env(){return env},
    get safe(){return safe},
    get debug(){return debug},
    get config(){return config},
    get extend(){return extend},
    get render(){return render},
    get util(){return util},
    get call(){return call},
    get i18n(){return i18n.i18n},
    get route(){return route},
    get db(){return db}
  };

  hexo.cache = {};

  // Inherits EventEmitter
  hexo.__proto__ = EventEmitter.prototype;

  // Emit "exit" event when process about to exit
  process.on('exit', function(){
    hexo.emit('exit');
  });

  // Load renderer plugins
  require('./plugins/renderer');

  async.auto({
    // Load config
    config: function(next){
      var configPath = baseDir + '_config.yml';
      fs.exists(configPath, function(exist){
        if (exist){
          render.render({path: configPath}, function(err, result){
            if (err) return new Error('Config compiled error');
            config = _.extend(defaults, result);
            Object.freeze(config);
            next(null, true);
          });
        } else {
          next(null, false);
        }
      });
    },
    // Update package.json
    update: ['config', function(next, results){
      if (!results.config) return next();

      var packagePath = baseDir + 'package.json';

      fs.readFile(packagePath, 'utf8', function(err, result){
        if (err) throw new Error('package.json read error');

        var obj = JSON.parse(result);

        if (version === obj.version){
          next();
        } else {
          obj.version = version;
          fs.writeFile(packagePath, JSON.stringify(obj, null, '  '), next);
        }
      });
    }],
    // Load plugins
    load_plugins: ['config', function(next, results){
      if (safe || !results.config) return next();

      var dir = baseDir + 'node_modules/';

      fs.exists(dir, function(exist){
        if (!exist) return next();
        fs.readdir(dir, function(err, files){
          if (err) throw new Error('Plugins loaded error');

          files.forEach(function(item){
            if (item.substring(0, 1) !== '.'){
              try {
                require(dir + item);
              } catch (err){
                console.log('Plugin loaded error: %s'.red, item.bold);
                if (debug) throw err;
              }
            }
          });

          next();
        });
      });
    }],
    // Load scripts
    load_scripts: ['config', function(next, results){
      if (safe || !results.config) return next();

      var dir = baseDir + 'scripts/';

      fs.exists(dir, function(exist){
        if (!exist) return next();
        fs.readdir(dir, function(err, files){
          if (err) throw new Error('Scripts loaded error');

          files.forEach(function(item){
            if (item.substring(0, 1) !== '.'){
              try {
                require(dir + item);
              } catch (err){
                console.log('Script loaded error: %s'.red, item.bold);
                if (debug) throw err;
              }
            }
          });

          next();
        });
      });
    }]
  }, function(err, results){
    var init = results.config;

    if (results.config){
      require('./plugins/tag');
      require('./plugins/deployer');
      require('./plugins/processor');
      require('./plugins/helper');
      require('./plugins/generator');
    }

    // Load console plugins
    require('./plugins/console');
    var list = extend.console.list();

    // Filter console
    _.each(list, function(val, key){
      var options = val.options;
      if ((!init && !options.init) || (!debug && options.debug)){
        delete list[key];
      }
    });

    var keys = Object.keys(list),
      command = args._[0] ? args._.shift().toLowerCase() : '';

    if (keys.indexOf(command) === -1){
      var maxLen = 4,
        result = '\nUsage: hexo <command>\n\nCommands:\n';

      var helps = [
        ['help', 'Display help']
      ];

      _.each(list, function(val, key){
        helps.push([key, val.description]);
      });

      helps = helps.sort(function(a, b){
        var orderA = a[0],
          orderB = b[0];

        if (orderA.length >= orderB.length && maxLen < orderA.length) maxLen = orderA.length;
        else if (maxLen < orderB.length) maxLen = orderB.length;

        if (orderA < orderB) return -1;
        else if (orderA > orderB) return 1;
        else return 0;
      });

      helps.forEach(function(item){
        result += '  ' + item[0].bold;

        for (var i=0; i<maxLen + 3 - item[0].length; i++){
          result += ' ';
        }

        result += item[1] + '\n';
      });

      console.log(result);
    } else {
      hexo.emit('ready');
      list[command](args, function(){
        process.exit();
      });
    }
  });
};