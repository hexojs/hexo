var util = require('../util');
var Promise = require('bluebird');
var pathFn = require('path');
var tildify = require('tildify');
var Database = require('warehouse');
var _ = require('lodash');
var EventEmitter = require('events').EventEmitter;
var pkg = require('../../package.json');
var createLogger = require('./create_logger');
var extend = require('../extend');
var Render = require('./render');
var registerModels = require('./register_models');
var Post = require('./post');
var Scaffold = require('./scaffold');
var Router = util.Router;
var defaultConfig = require('./default_config');

var libDir = pathFn.dirname(__dirname);
var dbVersion = 1;

require('colors');

function Hexo(base, args){
  base = base || process.cwd();
  args = args || {};

  EventEmitter.call(this);

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
      return db.model('Post');
    },
    get pages(){
      return db.model('Page');
    },
    get categories(){
      return db.model('Category');
    },
    get tags(){
      return db.model('Tag');
    }
  };
}

util.inherits(Hexo, EventEmitter);

Hexo.prototype.init = function(){
  var self = this;

  this.log.debug('Hexo version: %s', this.version.magenta);
  this.log.debug('Working directory: %s', tildify(this.base_dir).magenta);

  // Load internal plugins
  require('../plugins/console')(this);
  require('../plugins/deployer')(this);
  require('../plugins/filter')(this);
  require('../plugins/generator')(this);
  require('../plugins/helper')(this);
  require('../plugins/processor')(this);
  require('../plugins/renderer')(this);
  require('../plugins/tag')(this);

  // Load config
  return require('./load_config')(this).then(function(){
    // Load external plugins & scripts
    return Promise.all([
      require('./load_plugins')(self),
      require('./load_scripts')(self),
      require('./update_package')(self)
    ]);
  }).then(function(){
    // Load database
    return require('./load_database')(self);
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
    if (!c) return reject(new Error('Console `' + name + '` is not registered'));

    return c.call(self, args);
  }).nodeify(callback);
};

Hexo.prototype.model = function(name, schema){
  return this.database.model(name, schema);
};

Hexo.lib_dir = Hexo.prototype.lib_dir = libDir;

Hexo.core_dir = Hexo.prototype.core_dir = pathFn.dirname(libDir);

Hexo.version = Hexo.prototype.version = pkg.version;

Hexo.util = Hexo.prototype.util = util;

module.exports = Hexo;