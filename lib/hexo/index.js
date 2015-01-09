var util = require('hexo-util');
var Promise = require('bluebird');
var pathFn = require('path');
var tildify = require('tildify');
var Database = require('warehouse');
var _ = require('lodash');
var chalk = require('chalk');
var EventEmitter = require('events').EventEmitter;
var fs = require('hexo-fs');
var Module = require('module');
var vm = require('vm');
var pkg = require('../../package.json');
var createLogger = require('./create_logger');
var extend = require('../extend');
var Render = require('./render');
var registerModels = require('./register_models');
var Post = require('./post');
var Scaffold = require('./scaffold');
var Source = require('./source');
var Router = require('./router');
var defaultConfig = require('./default_config');

var libDir = pathFn.dirname(__dirname);
var dbVersion = 1;

function Hexo(base, args){
  base = base || process.cwd();
  args = args || {};

  EventEmitter.call(this);

  var self = this;

  this.base_dir = base + pathFn.sep;
  this.public_dir = pathFn.join(base, 'public') + pathFn.sep;
  this.source_dir = pathFn.join(base, 'source') + pathFn.sep;
  this.plugin_dir = pathFn.join(base, 'node_modules') + pathFn.sep;
  this.script_dir = pathFn.join(base, 'scripts') + pathFn.sep;
  this.scaffold_dir = pathFn.join(base, 'scaffolds') + pathFn.sep;

  this.env = {
    args: args,
    debug: Boolean(args.debug),
    safe: Boolean(args.safe),
    silent: Boolean(args.silent),
    env: process.env.NODE_ENV || 'development',
    version: pkg.version,
    init: false
  };

  this.config_path = args.config ? pathFn.resolve(base, args.config)
                                 : pathFn.join(base, '_config.yml');

  this.extend = {
    console: new extend.Console(),
    deployer: new extend.Deployer(),
    filter: new extend.Filter(),
    generator: new extend.Generator(),
    helper: new extend.Helper(),
    migrator: new extend.Migrator(),
    processor: new extend.Processor(),
    renderer: new extend.Renderer(),
    tag: new extend.Tag()
  };

  this.config = _.clone(defaultConfig);

  this.log = createLogger(this.env);

  this.render = new Render(this);

  this.route = new Router();

  this.post = new Post(this);

  this.scaffold = new Scaffold(this);

  var db = this.database = new Database({
    version: dbVersion,
    path: pathFn.join(base, 'db.json')
  });

  registerModels(this);

  this.locals = {
    get posts(){
      var query = {};

      if (!self.config.future){
        query.date = {$lte: Date.now()};
      }

      if (!self._showDrafts()){
        query.published = true;
      }

      return db.model('Post').find(query);
    },
    get pages(){
      var query = {};

      if (!self.config.future){
        query.date = {$lte: Date.now()};
      }

      return db.model('Page').find(query);
    },
    get categories(){
      return db.model('Category');
    },
    get tags(){
      return db.model('Tag');
    }
  };

  this.source = new Source(this);
}

require('util').inherits(Hexo, EventEmitter);

Hexo.prototype.init = function(){
  var self = this;

  this.log.debug('Hexo version: %s', chalk.magenta(this.version));
  this.log.debug('Working directory: %s', chalk.magenta(tildify(this.base_dir)));

  // Load internal plugins
  require('../plugins/console')(this);
  require('../plugins/filter')(this);
  require('../plugins/generator')(this);
  require('../plugins/helper')(this);
  require('../plugins/processor')(this);
  require('../plugins/renderer')(this);
  require('../plugins/tag')(this);

  // Load config
  return Promise.each([
    'load_config', // Load config
    'update_package', // Update package.json
    'load_plugins', // Load external plugins & scripts
    'load_database' // Load database
  ], function(name){
    return require('./' + name)(self);
  }).then(function(){
    // Ready to go!
    self.emit('ready');
  });
};

Hexo.prototype.call = function(name, args, callback){
  if (!callback && typeof args === 'function'){
    callback = args;
    args = {};
  }

  var self = this;

  return new Promise(function(resolve, reject){
    var c = self.extend.console.get(name);

    if (c){
      c.call(self, args).then(resolve, reject);
    } else {
      reject(new Error('Console `' + name + '` has not been registered yet!'));
    }
  }).nodeify(callback);
};

Hexo.prototype.model = function(name, schema){
  return this.database.model(name, schema);
};

Hexo.prototype.loadPlugin = function(path, callback){
  var self = this;

  return fs.readFile(path).then(function(script){
    // Based on: https://github.com/joyent/node/blob/v0.10.33/src/node.js#L516
    var module = new Module(path);
    module.filename = path;
    module.paths = Module._nodeModulePaths(path);

    function require(path){
      return module.require(path);
    }

    require.resolve = function(request){
      return Module._resolveFilename(request, module);
    };

    require.main = process.mainModule;
    require.extensions = Module._extensions;
    require.cache = Module._cache;

    script = '(function(exports, require, module, __filename, __dirname, hexo){' +
      script + '});';

    var fn = vm.runInThisContext(script, path);

    return fn(module.exports, require, module, path, pathFn.dirname(path), self);
  }).nodeify(callback);
};

Hexo.prototype._showDrafts = function(){
  var args = this.env.args;
  return args.draft || args.drafts || this.config.render_drafts;
};

Hexo.lib_dir = Hexo.prototype.lib_dir = libDir + pathFn.sep;

Hexo.core_dir = Hexo.prototype.core_dir = pathFn.dirname(libDir) + pathFn.sep;

Hexo.version = Hexo.prototype.version = pkg.version;

Hexo.util = Hexo.prototype.util = util;

module.exports = Hexo;