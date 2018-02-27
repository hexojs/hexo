'use strict';

const Promise = require('bluebird');
const pathFn = require('path');
const tildify = require('tildify');
const Database = require('warehouse');
const _ = require('lodash');
const chalk = require('chalk');
const EventEmitter = require('events').EventEmitter;
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

const libDir = pathFn.dirname(__dirname);
const sep = pathFn.sep;
const dbVersion = 1;

function Hexo(base = process.cwd(), args = {}) {
  const mcp = multiConfigPath(this);

  EventEmitter.call(this);

  this.base_dir = base + sep;
  this.public_dir = pathFn.join(base, 'public') + sep;
  this.source_dir = pathFn.join(base, 'source') + sep;
  this.plugin_dir = pathFn.join(base, 'node_modules') + sep;
  this.script_dir = pathFn.join(base, 'scripts') + sep;
  this.scaffold_dir = pathFn.join(base, 'scaffolds') + sep;
  this.theme_dir = pathFn.join(base, 'themes', defaultConfig.theme) + sep;
  this.theme_script_dir = pathFn.join(this.theme_dir, 'scripts') + sep;

  this.env = {
    args,
    debug: Boolean(args.debug),
    safe: Boolean(args.safe),
    silent: Boolean(args.silent),
    env: process.env.NODE_ENV || 'development',
    version: pkg.version,
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

  this.config = _.cloneDeep(defaultConfig);

  this.log = logger(this.env);

  this.render = new Render(this);

  this.route = new Router();

  this.post = new Post(this);

  this.scaffold = new Scaffold(this);

  this._dbLoaded = false;

  this._isGenerating = false;

  this.database = new Database({
    version: dbVersion,
    path: pathFn.join(base, 'db.json')
  });

  this.config_path = args.config ? mcp(base, args.config) :
    pathFn.join(base, '_config.yml');

  registerModels(this);

  this.source = new Source(this);
  this.theme = new Theme(this);
  this.locals = new Locals(this);
  this._bindLocals();
}

require('util').inherits(Hexo, EventEmitter);

Hexo.prototype._bindLocals = function() {
  const db = this.database;
  const locals = this.locals;
  const self = this;

  locals.set('posts', () => {
    const query = {};

    if (!self.config.future) {
      query.date = {$lte: Date.now()};
    }

    if (!self._showDrafts()) {
      query.published = true;
    }

    return db.model('Post').find(query);
  });

  locals.set('pages', () => {
    const query = {};

    if (!self.config.future) {
      query.date = {$lte: Date.now()};
    }

    return db.model('Page').find(query);
  });

  locals.set('categories', () => db.model('Category'));

  locals.set('tags', () => db.model('Tag'));

  locals.set('data', () => {
    const obj = {};

    db.model('Data').forEach(data => {
      obj[data._id] = data.data;
    });

    return obj;
  });
};

Hexo.prototype.init = function() {
  const self = this;

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
  ], name => require(`./${name}`)(self)).then(() => self.execFilter('after_init', null, {context: self})).then(() => {
    // Ready to go!
    self.emit('ready');
  });
};

Hexo.prototype.call = function(name, args, callback) {
  if (!callback && typeof args === 'function') {
    callback = args;
    args = {};
  }

  const self = this;

  return new Promise((resolve, reject) => {
    const c = self.extend.console.get(name);

    if (c) {
      c.call(self, args).then(resolve, reject);
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
    return pathFn.join(baseDir, 'node_modules', name);
  }
};

Hexo.prototype.loadPlugin = function(path, callback) {
  const self = this;

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

    return fn(module.exports, require, module, path, pathFn.dirname(path), self);
  }).asCallback(callback);
};

Hexo.prototype._showDrafts = function() {
  const args = this.env.args;
  return args.draft || args.drafts || this.config.render_drafts;
};

Hexo.prototype.load = function(callback) {
  const self = this;

  return loadDatabase(this).then(() => {
    self.log.info('Start processing');

    return Promise.all([
      self.source.process(),
      self.theme.process()
    ]);
  }).then(() => self._generate({cache: true})).asCallback(callback);
};

Hexo.prototype.watch = function(callback) {
  const self = this;

  this._watchBox = _.debounce(() => self._generate({cache: false}), 100);

  return loadDatabase(this).then(() => {
    self.log.info('Start processing');

    return Promise.all([
      self.source.watch(),
      self.theme.watch()
    ]);
  }).then(() => {
    self.source.on('processAfter', self._watchBox);
    self.theme.on('processAfter', self._watchBox);

    return self._generate({cache: false});
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

Hexo.prototype._generate = function(options) {
  if (this._isGenerating) return;

  options = options || {};
  this._isGenerating = true;

  const config = this.config;
  const generators = this.extend.generator.list();
  const route = this.route;
  const keys = Object.keys(generators);
  const self = this;
  const routeList = route.list();
  const log = this.log;
  const theme = this.theme;
  const newRouteList = [];
  let siteLocals = {};

  this.emit('generateBefore');

  function Locals(path, locals) {
    this.page = typeof locals === 'object' ? locals : {};
    if (this.page.path == null) this.page.path = path;

    this.path = path;
    this.url = `${config.url}/${path}`;
  }

  Locals.prototype.config = config;
  Locals.prototype.theme = _.assign({}, config, theme.config, config.theme_config);
  Locals.prototype._ = _;
  Locals.prototype.layout = 'layout';
  Locals.prototype.cache = options.cache;
  Locals.prototype.env = this.env;
  Locals.prototype.view_dir = pathFn.join(this.theme_dir, 'layout') + sep;

  // Run before_generate filters
  return this.execFilter('before_generate', self.locals.get('data'), {context: this})
    .then(() => {
      self.locals.invalidate();
      siteLocals = self.locals.toObject();
      Locals.prototype.site = siteLocals;

      // Run generators
      return Promise.map(keys, key => {
        const generator = generators[key];

        return generator.call(self, siteLocals).then(data => {
          log.debug('Generator: %s', chalk.magenta(key));
          return data;
        });
      }).reduce((result, data) => {
        return data ? result.concat(data) : result;
      }, []);
    })
  // Add routes
    .map(item => {
      if (typeof item !== 'object' || item.path == null) return undefined;

      const path = route.format(item.path);
      const data = item.data;
      let layout = item.layout;

      newRouteList.push(path);

      if (!layout) {
        return route.set(path, data);
      }

      if (Array.isArray(layout)) {
        layout = _.uniq(layout);
      } else {
        layout = [layout];
      }

      const locals = new Locals(path, data);
      const layoutLength = layout.length;
      let cache;

      function saveCache(result) {
        cache = result;
        return result;
      }

      return self.execFilter('template_locals', locals, {context: self})
        .then(locals => {
          route.set(path, () => {
            if (options.cache && cache != null) return cache;

            let view, name;

            for (let i = 0; i < layoutLength; i++) {
              name = layout[i];
              view = theme.getView(name);

              if (view) {
                log.debug('Rendering %s: %s', name, chalk.magenta(path));
                return view.render(locals).then(saveCache);
              }
            }

            log.warn('No layout: %s', chalk.magenta(path));
          });
        });
    }).then(() => {
      // Remove old routes
      const removed = _.difference(routeList, newRouteList);

      for (let i = 0, len = removed.length; i < len; i++) {
        route.remove(removed[i]);
      }

      routeList.length = 0;
      newRouteList.length = 0;

      self.emit('generateAfter');

      // Run after_generate filters
      return self.execFilter('after_generate', null, {context: self});
    }).finally(() => {
      self._isGenerating = false;
    });
};

Hexo.prototype.exit = function(err) {
  const self = this;

  if (err) {
    this.log.fatal(
      {err},
      'Something\'s wrong. Maybe you can find the solution here: %s',
      chalk.underline('http://hexo.io/docs/troubleshooting.html')
    );
  }

  return this.execFilter('before_exit', null, {context: this}).then(() => {
    self.emit('exit', err);
  });
};

Hexo.prototype.execFilter = function(type, data, options) {
  return this.extend.filter.exec(type, data, options);
};

Hexo.prototype.execFilterSync = function(type, data, options) {
  return this.extend.filter.execSync(type, data, options);
};

Hexo.lib_dir = Hexo.prototype.lib_dir = libDir + sep;

Hexo.core_dir = Hexo.prototype.core_dir = pathFn.dirname(libDir) + sep;

Hexo.version = Hexo.prototype.version = pkg.version;

module.exports = Hexo;
