'use strict';

const Promise = require('bluebird');
const { sep, join, dirname } = require('path');
const tildify = require('tildify');
const Database = require('warehouse');
const { magenta, underline } = require('picocolors');
const { EventEmitter } = require('events');
const { readFile } = require('hexo-fs');
const Module = require('module');
const { runInThisContext } = require('vm');
const { version } = require('../../package.json');
const logger = require('hexo-log');
const { Console, Deployer, Filter, Generator, Helper, Injector, Migrator, Processor, Renderer, Tag } = require('../extend');
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
const { deepMerge, full_url_for } = require('hexo-util');
let resolveSync; // = require('resolve');

const libDir = dirname(__dirname);
const dbVersion = 1;

const stopWatcher = box => { if (box.isWatching()) box.unwatch(); };

const routeCache = new WeakMap();

const castArray = obj => { return Array.isArray(obj) ? obj : [obj]; };

const mergeCtxThemeConfig = ctx => {
  // Merge hexo.config.theme_config into hexo.theme.config before post rendering & generating
  // config.theme_config has "_config.[theme].yml" merged in load_theme_config.js
  if (ctx.config.theme_config) {
    ctx.theme.config = deepMerge(ctx.theme.config, ctx.config.theme_config);
  }
};

const createLoadThemeRoute = function(generatorResult, locals, ctx) {
  const { log, theme } = ctx;
  const { path, cache: useCache } = locals;

  const layout = [...new Set(castArray(generatorResult.layout))];
  const layoutLength = layout.length;

  // always use cache in fragment_cache
  locals.cache = true;
  return () => {
    if (useCache && routeCache.has(generatorResult)) return routeCache.get(generatorResult);

    for (let i = 0; i < layoutLength; i++) {
      const name = layout[i];
      const view = theme.getView(name);

      if (view) {
        log.debug(`Rendering HTML ${name}: ${magenta(path)}`);
        return view.render(locals)
          .then(result => ctx.extend.injector.exec(result, locals))
          .then(result => ctx.execFilter('_after_html_render', result, {
            context: ctx,
            args: [locals]
          }))
          .tap(result => {
            if (useCache) {
              routeCache.set(generatorResult, result);
            }
          }).tapCatch(err => {
            log.error({ err }, `Render HTML failed: ${magenta(path)}`);
          });
      }
    }

    log.warn(`No layout: ${magenta(path)}`);
  };
};

function debounce(func, wait) {
  let timeout;
  return function() {
    const context = this;
    const args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func.apply(context, args);
    }, wait);
  };
}

class Hexo extends EventEmitter {
  constructor(base = process.cwd(), args = {}) {
    super();

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
      version,
      cmd: args._ ? args._[0] : '',
      init: false
    };

    this.extend = {
      console: new Console(),
      deployer: new Deployer(),
      filter: new Filter(),
      generator: new Generator(),
      helper: new Helper(),
      injector: new Injector(),
      migrator: new Migrator(),
      processor: new Processor(),
      renderer: new Renderer(),
      tag: new Tag()
    };

    this.config = { ...defaultConfig };

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

    if (/^(init|new|g|publish|s|deploy|render|migrate)/.test(this.env.cmd)) {
      this.log.d(`Writing database to ${join(dbPath, 'db.json')}`);
    }

    this.database = new Database({
      version: dbVersion,
      path: join(dbPath, 'db.json')
    });

    const mcp = multiConfigPath(this);

    this.config_path = args.config ? mcp(base, args.config, args.output)
      : join(base, '_config.yml');

    registerModels(this);

    this.source = new Source(this);
    this.theme = new Theme(this);
    this.locals = new Locals(this);
    this._bindLocals();
  }

  _bindLocals() {
    const db = this.database;
    const { locals } = this;

    locals.set('posts', () => {
      const query = {};

      if (!this.config.future) {
        query.date = { $lte: Date.now() };
      }

      if (!this._showDrafts()) {
        query.published = true;
      }

      return db.model('Post').find(query);
    });

    locals.set('pages', () => {
      const query = {};

      if (!this.config.future) {
        query.date = { $lte: Date.now() };
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
  }

  init() {
    this.log.debug('Hexo version: %s', magenta(this.version));
    this.log.debug('Working directory: %s', magenta(tildify(this.base_dir)));

    // Load internal plugins
    require('../plugins/console')(this);
    require('../plugins/filter')(this);
    require('../plugins/generator')(this);
    require('../plugins/helper')(this);
    require('../plugins/injector')(this);
    require('../plugins/processor')(this);
    require('../plugins/renderer')(this);
    require('../plugins/tag')(this);

    // Load config
    return Promise.each([
      'update_package', // Update package.json
      'load_config', // Load config
      'load_theme_config', // Load alternate theme config
      'load_plugins' // Load external plugins & scripts
    ], name => require(`./${name}`)(this)).then(() => this.execFilter('after_init', null, { context: this })).then(() => {
      // Ready to go!
      this.emit('ready');
    });
  }

  call(name, args, callback) {
    if (!callback && typeof args === 'function') {
      callback = args;
      args = {};
    }

    const c = this.extend.console.get(name);

    if (c) return Reflect.apply(c, this, [args]).asCallback(callback);
    return Promise.reject(new Error(`Console \`${name}\` has not been registered yet!`));
  }

  model(name, schema) {
    return this.database.model(name, schema);
  }

  resolvePlugin(name, basedir) {
    try {
      // Try to resolve the plugin with the Node.js's built-in require.resolve.
      return require.resolve(name, { paths: [basedir] });
    } catch (err) {
      try {
        // There was an error (likely the node_modules is corrupt or from early version of npm)
        // Use Hexo prior 6.0.0's behavior (resolve.sync) to resolve the plugin.
        resolveSync = resolveSync || require('resolve').sync;
        return resolveSync(name, { basedir });
      } catch (err) {
        // There was an error (likely the plugin wasn't found), so return a possibly
        // non-existing path that a later part of the resolution process will check.
        return join(basedir, 'node_modules', name);
      }
    }
  }

  loadPlugin(path, callback) {
    return readFile(path).then(script => {
      // Based on: https://github.com/joyent/node/blob/v0.10.33/src/node.js#L516
      const module = new Module(path);
      module.filename = path;
      module.paths = Module._nodeModulePaths(path);

      function req(path) {
        return module.require(path);
      }

      req.resolve = request => Module._resolveFilename(request, module);

      req.main = require.main;
      req.extensions = Module._extensions;
      req.cache = Module._cache;

      script = `(function(exports, require, module, __filename, __dirname, hexo){${script}\n});`;

      const fn = runInThisContext(script, path);

      return fn(module.exports, req, module, path, dirname(path), this);
    }).asCallback(callback);
  }

  _showDrafts() {
    const { args } = this.env;
    return args.draft || args.drafts || this.config.render_drafts;
  }

  load(callback) {
    return loadDatabase(this).then(() => {
      this.log.info('Start processing');

      return Promise.all([
        this.source.process(),
        this.theme.process()
      ]);
    }).then(() => {
      mergeCtxThemeConfig(this);
      return this._generate({ cache: false });
    }).asCallback(callback);
  }

  watch(callback) {
    let useCache = false;
    const { cache } = Object.assign({
      cache: false
    }, this.config.server);
    const { alias } = this.extend.console;

    if (alias[this.env.cmd] === 'server' && cache) {
      // enable cache when run hexo server
      useCache = true;
    }
    this._watchBox = debounce(() => this._generate({ cache: useCache }), 100);

    return loadDatabase(this).then(() => {
      this.log.info('Start processing');

      return Promise.all([
        this.source.watch(),
        this.theme.watch()
      ]);
    }).then(() => {
      mergeCtxThemeConfig(this);

      this.source.on('processAfter', this._watchBox);
      this.theme.on('processAfter', () => {
        this._watchBox();
        mergeCtxThemeConfig(this);
      });

      return this._generate({ cache: useCache });
    }).asCallback(callback);
  }

  unwatch() {
    if (this._watchBox != null) {
      this.source.removeListener('processAfter', this._watchBox);
      this.theme.removeListener('processAfter', this._watchBox);

      this._watchBox = null;
    }

    stopWatcher(this.source);
    stopWatcher(this.theme);
  }

  _generateLocals() {
    const { config, env, theme, theme_dir } = this;
    const ctx = { config: { url: this.config.url } };
    const localsObj = this.locals.toObject();

    class Locals {
      constructor(path, locals) {
        this.page = { ...locals };
        if (this.page.path == null) this.page.path = path;
        this.path = path;
        this.url = full_url_for.call(ctx, path);
        this.config = config;
        this.theme = theme.config;
        this.layout = 'layout';
        this.env = env;
        this.view_dir = join(theme_dir, 'layout') + sep;
        this.site = localsObj;
      }
    }

    return Locals;
  }

  _runGenerators() {
    this.locals.invalidate();
    const siteLocals = this.locals.toObject();
    const generators = this.extend.generator.list();
    const { log } = this;

    // Run generators
    return Promise.map(Object.keys(generators), key => {
      const generator = generators[key];

      log.debug('Generator: %s', magenta(key));
      return Reflect.apply(generator, this, [siteLocals]);
    }).reduce((result, data) => {
      return data ? result.concat(data) : result;
    }, []);
  }

  _routerReflesh(runningGenerators, useCache) {
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

      return this.execFilter('template_locals', new Locals(path, data), { context: this })
        .then(locals => { route.set(path, createLoadThemeRoute(generatorResult, locals, this)); })
        .thenReturn(path);
    }).then(newRouteList => {
      // Remove old routes
      for (let i = 0, len = routeList.length; i < len; i++) {
        const item = routeList[i];

        if (!newRouteList.includes(item)) {
          route.remove(item);
        }
      }
    });
  }

  _generate(options = {}) {
    if (this._isGenerating) return;

    const useCache = options.cache;

    this._isGenerating = true;

    this.emit('generateBefore');

    // Run before_generate filters
    return this.execFilter('before_generate', this.locals.get('data'), { context: this })
      .then(() => this._routerReflesh(this._runGenerators(), useCache)).then(() => {
        this.emit('generateAfter');

        // Run after_generate filters
        return this.execFilter('after_generate', null, { context: this });
      }).finally(() => {
        this._isGenerating = false;
      });
  }

  exit(err) {
    if (err) {
      this.log.fatal(
        { err },
        'Something\'s wrong. Maybe you can find the solution here: %s',
        underline('https://hexo.io/docs/troubleshooting.html')
      );
    }

    return this.execFilter('before_exit', null, { context: this }).then(() => {
      this.emit('exit', err);
    });
  }

  execFilter(type, data, options) {
    return this.extend.filter.exec(type, data, options);
  }

  execFilterSync(type, data, options) {
    return this.extend.filter.execSync(type, data, options);
  }
}

Hexo.lib_dir = libDir + sep;
Hexo.prototype.lib_dir = Hexo.lib_dir;

Hexo.core_dir = dirname(libDir) + sep;
Hexo.prototype.core_dir = Hexo.core_dir;

Hexo.version = version;
Hexo.prototype.version = Hexo.version;

module.exports = Hexo;
