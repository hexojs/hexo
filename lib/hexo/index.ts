import Promise from 'bluebird';
import { sep, join, dirname } from 'path';
import tildify from 'tildify';
import Database from 'warehouse';
import { magenta, underline } from 'picocolors';
import { EventEmitter } from 'events';
import { readFile } from 'hexo-fs';
import Module from 'module';
import { runInThisContext } from 'vm';
const { version } = require('../../package.json');
import logger from 'hexo-log';

import {
  Console,
  Deployer,
  Filter,
  Generator,
  Helper,
  Highlight,
  Injector,
  Migrator,
  Processor,
  Renderer,
  Tag
} from '../extend';

import Render from './render';
import registerModels from './register_models';
import Post from './post';
import Scaffold from './scaffold';
import Source from './source';
import Router from './router';
import Theme from '../theme';
import Locals from './locals';
import defaultConfig from './default_config';
import loadDatabase from './load_database';
import multiConfigPath from './multi_config_path';
import { deepMerge, full_url_for } from 'hexo-util';
import type Box from '../box';
import type { BaseGeneratorReturn, FilterOptions, LocalsType, NodeJSLikeCallback, SiteLocals } from '../types';
import type { AddSchemaTypeOptions } from 'warehouse/dist/types';
import type Schema from 'warehouse/dist/schema';
import BinaryRelationIndex from '../models/binary_relation_index';

const libDir = dirname(__dirname);
const dbVersion = 1;

const stopWatcher = (box: Box) => { if (box.isWatching()) box.unwatch(); };

const routeCache = new WeakMap();

const castArray = (obj: any) => { return Array.isArray(obj) ? obj : [obj]; };

// eslint-disable-next-line no-use-before-define
const mergeCtxThemeConfig = (ctx: Hexo) => {
  // Merge hexo.config.theme_config into hexo.theme.config before post rendering & generating
  // config.theme_config has "_config.[theme].yml" merged in load_theme_config.js
  if (ctx.config.theme_config) {
    ctx.theme.config = deepMerge(ctx.theme.config, ctx.config.theme_config);
  }
};

// eslint-disable-next-line no-use-before-define
const createLoadThemeRoute = function(generatorResult: BaseGeneratorReturn, locals: LocalsType, ctx: Hexo) {
  const { log, theme } = ctx;
  const { path, cache: useCache } = locals;

  const layout = [...new Set<string>(castArray(generatorResult.layout))];
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

function debounce(func: () => void, wait: number): () => void {
  let timeout: NodeJS.Timeout;
  return function() {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func.apply(this);
    }, wait);
  };
}

interface Args {

  /**
   * Enable debug mode. Display debug messages in the terminal and save debug.log in the root directory.
   */
  debug?: boolean;

  /**
   * Enable safe mode. Don’t load any plugins.
   */
  safe?: boolean;

  /**
   * Enable silent mode. Don’t display any messages in the terminal.
   */
  silent?: boolean;

  /**
   * Enable to add drafts to the posts list.
   */
  draft?: boolean;

    /**
   * Enable to add drafts to the posts list.
   */
  drafts?: boolean;
  _?: string[];
  output?: string;

  /**
   * Specify the path of the configuration file.
   */
  config?: string;
  [key: string]: any;
}

interface Query {
  date?: any;
  published?: boolean;
}

interface Extend {
  console: Console,
  deployer: Deployer,
  filter: Filter,
  generator: Generator,
  helper: Helper,
  highlight: Highlight,
  injector: Injector,
  migrator: Migrator,
  processor: Processor,
  renderer: Renderer,
  tag: Tag
}

interface Env {
  args: Args;
  debug: boolean;
  safe: boolean;
  silent: boolean;
  env: string;
  version: string;
  cmd: string;
  init: boolean;
}

type DefaultConfigType = typeof defaultConfig;
interface Config extends DefaultConfigType {
  [key: string]: any;
}

// Node.js internal APIs
declare module 'module' {
  function _nodeModulePaths(path: string): string[];
  function _resolveFilename(request: string, parent: Module, isMain?: any, options?: any): string;
  const _extensions: NodeJS.RequireExtensions,
    _cache: any;
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
interface Hexo {

  /**
   * Emitted before deployment begins.
   * @param event
   * @param listener
   * @link https://hexo.io/api/events.html#deployBefore
   */
  on(event: 'deployBefore', listener: (...args: any[]) => any): this;

  /**
   * Emitted after deployment begins.
   * @param event
   * @param listener
   * @link https://hexo.io/api/events.html#deployAfter
   */
  on(event: 'deployAfter', listener: (...args: any[]) => any): this;

  /**
   * Emitted before Hexo exits.
   * @param event
   * @param listener
   * @link https://hexo.io/api/events.html#exit
   */
  on(event: 'exit', listener: (...args: any[]) => any): this;

  /**
   * Emitted before generation begins.
   * @param event
   * @param listener
   * @link https://hexo.io/api/events.html#generateBefore
   */
  on(event: 'generateBefore', listener: (...args: any[]) => any): this;

  /**
   * Emitted after generation finishes.
   * @param event
   * @param listener
   * @link https://hexo.io/api/events.html#generateAfter
   */
  on(event: 'generateAfter', listener: (...args: any[]) => any): this;

  /**
   * Emitted after a new post has been created. This event returns the post data:
   * @param event
   * @param listener
   * @link https://hexo.io/api/events.html#new
   */
  on(event: 'new', listener: (post: { path: string; content: string; }) => any): this;

  /**
   * Emitted before processing begins. This event returns a path representing the root directory of the box.
   * @param event
   * @param listener
   * @link https://hexo.io/api/events.html#processBefore
   */
  on(event: 'processBefore', listener: (...args: any[]) => any): this;

  /**
   * Emitted after processing finishes. This event returns a path representing the root directory of the box.
   * @param event
   * @param listener
   * @link https://hexo.io/api/events.html#processAfter
   */
  on(event: 'processAfter', listener: (...args: any[]) => any): this;

  /**
   * Emitted after initialization finishes.
   * @param event
   * @param listener
   */
  on(event: 'ready', listener: (...args: any[]) => any): this;

  /**
   * undescripted on emit
   * @param event
   * @param listener
   */
  on(event: string, listener: (...args: any[]) => any): any;
  emit(event: string, ...args: any[]): any;
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
class Hexo extends EventEmitter {
  public base_dir: string;
  public public_dir: string;
  public source_dir: string;
  public plugin_dir: string;
  public script_dir: string;
  public scaffold_dir: string;
  public theme_dir: string;
  public theme_script_dir: string;
  public env: Env;
  public extend: Extend;
  public config: Config;
  public log: ReturnType<typeof logger>;
  public render: Render;
  public route: Router;
  public post: Post;
  public scaffold: Scaffold;
  public _dbLoaded: boolean;
  public _isGenerating: boolean;
  public database: Database;
  public config_path: string;
  public source: Source;
  public theme: Theme;
  public locals: Locals;
  public version: string;
  public _watchBox: () => void;
  public lib_dir: string;
  public core_dir: string;
  static lib_dir: string;
  static core_dir: string;
  static version: string;
  public _binaryRelationIndex: {
    post_tag: BinaryRelationIndex<'post_id', 'tag_id'>;
    post_category: BinaryRelationIndex<'post_id', 'category_id'>;
  };

  constructor(base = process.cwd(), args: Args = {}) {
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
      highlight: new Highlight(),
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
    this.locals = new Locals();
    this._bindLocals();
    this._binaryRelationIndex = {
      post_tag: new BinaryRelationIndex<'post_id', 'tag_id'>('post_id', 'tag_id', 'PostTag', this),
      post_category: new BinaryRelationIndex<'post_id', 'category_id'>('post_id', 'category_id', 'PostCategory', this)
    };
  }

  _bindLocals(): void {
    const db = this.database;
    const { locals } = this;

    locals.set('posts', () => {
      const query: Query = {};

      if (!this.config.future) {
        query.date = { $lte: Date.now() };
      }

      if (!this._showDrafts()) {
        query.published = true;
      }

      return db.model('Post').find(query);
    });

    locals.set('pages', () => {
      const query: Query = {};

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

  /**
   * Load configuration and plugins.
   * @returns {Promise}
   * @link https://hexo.io/api#Initialize
   */
  init(): Promise<void> {
    this.log.debug('Hexo version: %s', magenta(this.version));
    this.log.debug('Working directory: %s', magenta(tildify(this.base_dir)));

    // Load internal plugins
    require('../plugins/console')(this);
    require('../plugins/filter')(this);
    require('../plugins/generator')(this);
    require('../plugins/helper')(this);
    require('../plugins/highlight')(this);
    require('../plugins/injector')(this);
    require('../plugins/processor')(this);
    require('../plugins/renderer')(this);
    require('../plugins/tag').default(this);

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

  /**
   * Call any console command explicitly.
   * @param name
   * @param args
   * @param callback
   * @returns {Promise}
   * @link https://hexo.io/api#Execute-Commands
   */
  call(name: string, callback?: NodeJSLikeCallback<any>): Promise<any>;
  call(name: string, args: object, callback?: NodeJSLikeCallback<any>): Promise<any>;
  call(name: string, args?: object | NodeJSLikeCallback<any>, callback?: NodeJSLikeCallback<any>): Promise<any> {
    if (!callback && typeof args === 'function') {
      callback = args as NodeJSLikeCallback<any>;
      args = {};
    }

    const c = this.extend.console.get(name);

    if (c) return (Reflect.apply(c, this, [args]) as any).asCallback(callback);
    return Promise.reject(new Error(`Console \`${name}\` has not been registered yet!`));
  }

  model(name: string, schema?: Schema | Record<string, AddSchemaTypeOptions>) {
    return this.database.model(name, schema);
  }

  resolvePlugin(name: string, basedir: string): string {
    try {
      // Try to resolve the plugin with the Node.js's built-in require.resolve.
      return require.resolve(name, { paths: [basedir] });
    } catch {
      // There was an error (likely the node_modules is corrupt or from early version of npm),
      // so return a possibly non-existing path that a later part of the resolution process will check.
      return join(basedir, 'node_modules', name);
    }
  }

  loadPlugin(path: string, callback?: NodeJSLikeCallback<any>): Promise<any> {
    return readFile(path).then(script => {
      // Based on: https://github.com/nodejs/node-v0.x-archive/blob/v0.10.33/src/node.js#L516
      const module = new Module(path);
      module.filename = path;
      module.paths = Module._nodeModulePaths(path);

      function req(path: string) {
        return module.require(path);
      }

      req.resolve = (request: string) => Module._resolveFilename(request, module);

      req.main = require.main;
      req.extensions = Module._extensions;
      req.cache = Module._cache;

      script = `(async function(exports, require, module, __filename, __dirname, hexo){${script}\n});`;

      const fn = runInThisContext(script, path);

      return fn(module.exports, req, module, path, dirname(path), this);
    }).asCallback(callback);
  }

  _showDrafts(): boolean {
    const { args } = this.env;
    return args.draft || args.drafts || this.config.render_drafts;
  }

  /**
   * Load all files in the source folder as well as the theme data.
   * @param callback
   * @returns {Promise}
   * @link https://hexo.io/api#Load-Files
   */
  load(callback?: NodeJSLikeCallback<any>): Promise<any> {
    return loadDatabase(this).then(() => {
      this._binaryRelationIndex.post_tag.load();
      this._binaryRelationIndex.post_category.load();
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

  /**
   * Load all files in the source folder as well as the theme data.
   * Start watching for file changes continuously.
   * @param callback
   * @returns {Promise}
   * @link https://hexo.io/api#Load-Files
   */
  watch(callback?: NodeJSLikeCallback<any>): Promise<any> {
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

  unwatch(): void {
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
    const localsObj = this.locals.toObject() as SiteLocals;

    class Locals {
      page: any;
      path: string;
      url: string;
      config: Config;
      theme: any;
      layout: string;
      env: Env;
      view_dir: string;
      site: SiteLocals;
      cache?: boolean;

      constructor(path: string, locals: any) {
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

  _runGenerators(): Promise<BaseGeneratorReturn[]> {
    this.locals.invalidate();
    const siteLocals = this.locals.toObject() as SiteLocals;
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

  _routerRefresh(runningGenerators: Promise<BaseGeneratorReturn[]>, useCache: boolean): Promise<void> {
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
        .then((locals: LocalsType) => { route.set(path, createLoadThemeRoute(generatorResult, locals, this)); })
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

  _generate(options: { cache?: boolean } = {}): Promise<any> {
    if (this._isGenerating) return;

    const useCache = options.cache;

    this._isGenerating = true;

    this.emit('generateBefore');

    // Run before_generate filters
    // https://github.com/hexojs/hexo/issues/5287
    // locals should be invalidated before before_generate filters because tags may use locals
    this.locals.invalidate();
    return this.execFilter('before_generate', null, { context: this })
      .then(() => this._routerRefresh(this._runGenerators(), useCache)).then(() => {
        this.emit('generateAfter');

        // Run after_generate filters
        return this.execFilter('after_generate', null, { context: this });
      }).finally(() => {
        this._isGenerating = false;
      });
  }

  /**
   * Exit gracefully and finish up important things such as saving the database.
   * @param err
   * @returns {Promise}
   * @link https://hexo.io/api/#Exit
   */
  exit(err?: any): Promise<void> {
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

  execFilter(type: string, data: any, options?: FilterOptions) {
    return this.extend.filter.exec(type, data, options);
  }

  execFilterSync(type: string, data: any, options?: FilterOptions) {
    return this.extend.filter.execSync(type, data, options);
  }
}

Hexo.lib_dir = libDir + sep;
Hexo.prototype.lib_dir = Hexo.lib_dir;

Hexo.core_dir = dirname(libDir) + sep;
Hexo.prototype.core_dir = Hexo.core_dir;

Hexo.version = version;
Hexo.prototype.version = Hexo.version;

// define global variable
// this useful for plugin written in typescript
declare global {
  // eslint-disable-next-line one-var
  const hexo: Hexo;
}

export = Hexo;
