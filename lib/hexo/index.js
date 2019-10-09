'use strict';

const Promise = require('bluebird');
const { sep, join, dirname } = require('path');
const tildify = require('tildify');
const Database = require('warehouse');
const _ = require('lodash');
const chalk = require('chalk');
const { EventEmitter } = require('events');
const fs = require('hexo-fs');
const Module = require('module');
const vm = require('vm');
const pkg = require('../../package.json');
const logger = require('hexo-log');
const extend = require('../extend');
const Render = require('./render');
const registerModels = require('./register_models');
const Post = require('./post');
const Scaffold = require('./scaffold');
const Source = require('./source');
const Router = require('./router');
const Theme = require('../theme');
const Locals = require('./locals');
const defaultConfig = require('./default_config');
const loadDatabase = require('./load_database');
const multiConfigPath = require('./multi_config_path');
const resolve = require('resolve');
const full_url_for = require('../plugins/helper/full_url_for');

const { cloneDeep, debounce } = _;

const libDir = dirname(__dirname);
const dbVersion = 1;

function Hexo(base = process.cwd(), args = {}) {
  Reflect.apply(EventEmitter, this, []);

  this.base_dir = base + sep;
  this.public_dir = join(base, 'public') + sep;
  this.source_dir = join(base, 'source') + sep;
  this.plugin_dir = join(base, 'node_modules') + sep;
  this.script_dir = join(base, 'scripts') + sep;
  this.scaffold_dir = join(base, 'scaffolds') + sep;
  this.theme_dir = join(base, 'themes', defaultConfig.theme) + sep;
  this.theme_script_dir = join(this.theme_dir, 'scripts') + sep;

  this.env = {
    args,
    debug: Boolean(args.debug),
    safe: Boolean(args.safe),
    silent: Boolean(args.silent),
    env: process.env.NODE_ENV || 'development',
    version: pkg.version,
    cmd: args._ ? args._[0] : '',
    init: false
  };

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

  this.config = cloneDeep(defaultConfig);

  this.log = logger(this.env);

  this.render = new Render(this);

  this.route = new Router();

  this.post = new Post(this);

  this.scaffold = new Scaffold(this);

  this._dbLoaded = false;

  this._isGenerating = false;

  // If `output` is provided, use that as the
  // root for saving the db. Otherwise default to `base`.
  const dbPath = args.output || base;

  this.log.d(`Writing database to ${dbPath}/db.json`);

  this.database = new Database({
    version: dbVersion,
    path: join(dbPath, 'db.json')
  });

  const mcp = multiConfigPath(this);

  this.config_path = args.config ? mcp(base, args.config, args.output) :
    join(base, '_config.yml');

  registerModels(this);

  this.source = new Source(this);
  this.theme = new Theme(this);
  this.locals = new Locals(this);
  this._bindLocals();
}

require('util').inherits(Hexo, EventEmitter);

Hexo.prototype._bindLocals = function() {
  const db = this.database;
  const { locals } = this;

  locals.set('posts', () => {
    const query = {};

    if (!this.config.future) {
      query.date = {$lte: Date.now()};
    }

    if (!this._showDrafts()) {
      query.published = true;
    }

    return db.model('Post').find(query);
  });

  locals.set('pages', () => {
    const query = {};

    if (!this.config.future) {
      query.date = {$lte: Date.now()};
    }

    return db.model('Page').find(query);
  });

  locals.set('categories', () => {
    // Ignore categories with zero posts
    return db.model('Category').filter(category => category.length);
  });

  locals.set('tags', () => {
    // Ignore tags with zero posts
    return db.model('Tag').filter(tag => tag.length);
  });

  locals.set('data', () => {
    const obj = {};

    db.model('Data').forEach(data => {
      obj[data._id] = data.data;
    });

    return obj;
  });
};

Hexo.prototype.init = function() {
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
    'update_package', // Update package.json
    'load_config', // Load config
    'load_plugins' // Load external plugins & scripts
  ], name => require(`./${name}`)(this)).then(() => this.execFilter('after_init', null, {context: this})).then(() => {
    // Ready to go!
    this.emit('ready');
  });
};

Hexo.prototype.call = function(name, args, callback) {
  if (!callback && typeof args === 'function') {
    callback = args;
    args = {};
  }

  return new Promise((resolve, reject) => {
    const c = this.extend.console.get(name);

    if (c) {
      Reflect.apply(c, this, [args]).then(resolve, reject);
    } else {
      reject(new Error(`Console \`${name}\` has not been registered yet!`));
    }
  }).asCallback(callback);
};

Hexo.prototype.model = function(name, schema) {
  return this.database.model(name, schema);
};

Hexo.prototype.resolvePlugin = function(name) {
  const baseDir = this.base_dir;

  try {
    // Try to resolve the plugin with the resolve.sync.
    return resolve.sync(name, { basedir: baseDir });
  } catch (err) {
    // There was an error (likely the plugin wasn't found), so return a possibly
    // non-existing path that a later part of the resolution process will check.
    return join(baseDir, 'node_modules', name);
  }
};

Hexo.prototype.loadPlugin = function(path, callback) {
  return fs.readFile(path).then(script => {
    // Based on: https://github.com/joyent/node/blob/v0.10.33/src/node.js#L516
    const module = new Module(path);
    module.filename = path;
    module.paths = Module._nodeModulePaths(path);

    function require(path) {
      return module.require(path);
    }

    require.resolve = request => Module._resolveFilename(request, module);

    require.main = process.mainModule;
    require.extensions = Module._extensions;
    require.cache = Module._cache;

    script = `(function(exports, require, module, __filename, __dirname, hexo){${script}});`;

    const fn = vm.runInThisContext(script, path);

    return fn(module.exports, require, module, path, dirname(path), this);
  }).asCallback(callback);
};

Hexo.prototype._showDrafts = function() {
  const { args } = this.env;
  return args.draft || args.drafts || this.config.render_drafts;
};

Hexo.prototype.load = function(callback) {
  return loadDatabase(this).then(() => {
    this.log.info('Start processing');

    return Promise.all([
      this.source.process(),
      this.theme.process()
    ]);
  }).then(() => this._generate({cache: false})).asCallback(callback);
};

Hexo.prototype.watch = function(callback) {
  let useCache = false;
  if (this.env.cmd.startsWith('s')) {
    // enable cache when run hexo server
    useCache = true;
  }
  this._watchBox = debounce(() => this._generate({cache: useCache}), 100);

  return loadDatabase(this).then(() => {
    this.log.info('Start processing');

    return Promise.all([
      this.source.watch(),
      this.theme.watch()
    ]);
  }).then(() => {
    this.source.on('processAfter', this._watchBox);
    this.theme.on('processAfter', this._watchBox);

    return this._generate({cache: useCache});
  }).asCallback(callback);
};

Hexo.prototype.unwatch = function() {
  if (this._watchBox != null) {
    this.source.removeListener('processAfter', this._watchBox);
    this.theme.removeListener('processAfter', this._watchBox);

    this._watchBox = null;
  }

  stopWatcher(this.source);
  stopWatcher(this.theme);
};

function stopWatcher(box) {
  if (box.isWatching()) box.unwatch();
}

Hexo.prototype._generateLocals = function() {
  const { config, theme } = this;
  const ctx = { config: { url: this.config.url } };

  function Locals(path, locals) {
    this.page = typeof locals === 'object' ? locals : {};
    if (this.page.path == null) this.page.path = path;

    this.path = path;
    this.url = full_url_for.call(ctx, path);
  }

  Locals.prototype.config = config;
  Locals.prototype.theme = Object.assign({}, config, theme.config, config.theme_config);
  Locals.prototype._ = _;
  Locals.prototype.layout = 'layout';
  Locals.prototype.env = this.env;
  Locals.prototype.view_dir = join(this.theme_dir, 'layout') + sep;
  Locals.prototype.site = this.locals.toObject();

  return Locals;
};

Hexo.prototype._runGenerators = function() {
  this.locals.invalidate();
  const siteLocals = this.locals.toObject();
  const generators = this.extend.generator.list();
  const { log } = this;

  // Run generators
  return Promise.map(Object.keys(generators), key => {
    const generator = generators[key];

    return Reflect.apply(generator, this, [siteLocals]).then(data => {
      log.debug('Generator: %s', chalk.magenta(key));
      return data;
    });
  }).reduce((result, data) => {
    return data ? result.concat(data) : result;
  }, []);
};

const routeCache = new WeakMap();

const unique = array => array.filter((item, index, self) => self.indexOf(item) === index);

const castArray = obj => { return Array.isArray(obj) ? obj : [obj]; };

const createLoadThemeRoute = function(generatorResult, locals, ctx) {
  const { log, theme } = ctx;
  const { path, cache: useCache } = locals;

  const layout = unique(castArray(generatorResult.layout));
  const layoutLength = layout.length;

  // allways use cache in fragment_cache
  locals.cache = true;
  return () => {
    if (useCache && routeCache.has(generatorResult)) return routeCache.get(generatorResult);

    for (let i = 0; i < layoutLength; i++) {
      const name = layout[i];
      const view = theme.getView(name);

      if (view) {
        log.debug(`Rendering HTML ${name}: ${chalk.magenta(path)}`);
        return view.render(locals).tap(result => {
          if (useCache) {
            routeCache.set(generatorResult, result);
          }
        }).tapCatch(err => {
          log.error({ err }, `Render HTML failed: ${chalk.magenta(path)}`);
        });
      }
    }

    log.warn(`No layout: ${chalk.magenta(path)}`);
  };
};

Hexo.prototype._routerReflesh = function(runningGenerators, useCache) {
  const { route } = this;
  const routeList = route.list();
  const Locals = this._generateLocals();
  Locals.prototype.cache = useCache;

  return runningGenerators.map(generatorResult => {
    if (typeof generatorResult !== 'object' || generatorResult.path == null) return undefined;

    // add Route
    const path = route.format(generatorResult.path);
    const { data, layout } = generatorResult;

    if (!layout) {
      route.set(path, data);
      return path;
    }

    return this.execFilter('template_locals', new Locals(path, data), {context: this})
      .then(locals => { route.set(path, createLoadThemeRoute(generatorResult, locals, this)); })
      .thenReturn(path);
  }).then(newRouteList => {
    // Remove old routes
    const removed = routeList.filter(item => !newRouteList.includes(item));

    for (let i = 0, len = removed.length; i < len; i++) {
      route.remove(removed[i]);
    }
  });
};

Hexo.prototype._generate = function(options = {}) {
  if (this._isGenerating) return;

  const useCache = options.cache;

  this._isGenerating = true;

  this.emit('generateBefore');

  // Run before_generate filters
  return this.execFilter('before_generate', this.locals.get('data'), {context: this})
    .then(() => this._routerReflesh(this._runGenerators(), useCache)).then(() => {
      this.emit('generateAfter');

      // Run after_generate filters
      return this.execFilter('after_generate', null, {context: this});
    }).finally(() => {
      this._isGenerating = false;
    });
};

Hexo.prototype.exit = function(err) {
  if (err) {
    this.log.fatal(
      {err},
      'Something\'s wrong. Maybe you can find the solution here: %s',
      chalk.underline('https://hexo.io/docs/troubleshooting.html')
    );
  }

  return this.execFilter('before_exit', null, {context: this}).then(() => {
    this.emit('exit', err);
  });
};

Hexo.prototype.execFilter = function(type, data, options) {
  return this.extend.filter.exec(type, data, options);
};

Hexo.prototype.execFilterSync = function(type, data, options) {
  return this.extend.filter.execSync(type, data, options);
};

Hexo.lib_dir = Hexo.prototype.lib_dir = libDir + sep;

Hexo.core_dir = Hexo.prototype.core_dir = dirname(libDir) + sep;

Hexo.version = Hexo.prototype.version = pkg.version;

module.exports = Hexo;
