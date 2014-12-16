var Promise = require('bluebird');
var pathFn = require('path');
var _ = require('lodash');
var util = require('../util');
var Box = require('../box');
var View = require('./view');

require('colors');

function Theme(ctx){
  Box.call(this, ctx, ctx.theme_dir);

  this.config = {};

  this.views = {};

  this.processors = [
    require('./processors/config'),
    require('./processors/view'),
    require('./processors/source')
  ];

  var _View = this.View = function(path, data){
    View.call(this, path, data);
  };

  util.inherits(_View, View);

  _View.prototype._theme = this;
  _View.prototype._render = ctx.render;
  _View.prototype._helper = ctx.extend.helper;
}

util.inherits(Theme, Box);

Theme.prototype._generate = function(options){
  options = _.extend({
    watch: false
  }, options);

  var ctx = this.context;
  var config = ctx.config;
  var siteLocals = ctx.locals;

  var generators = ctx.extend.generator.list();
  var generatorKeys = Object.keys(generators);
  var excludeGenerator = config.exclude_generator || [];

  function Locals(path, locals){
    this.page = _.extend({
      path: path
    }, locals);

    this.path = path;
    this.url = config.url + config.root + path;
  }

  Locals.prototype.site = siteLocals;
  Locals.prototype.config = config;
  Locals.prototype.theme = _.extend({}, config, this.config, config.theme_config);
  Locals.prototype._ = _;
  Locals.prototype.layout = 'layout';
  Locals.prototype.cache = !options.watch;
  Locals.prototype.env = ctx.env;
  Locals.prototype.view_dir = pathFn.join(ctx.theme_dir, 'layouts') + pathFn.sep;

  function generateRender(path, layouts, locals){
    if (!Array.isArray(layouts)) layouts = [layouts];
    layouts = _.uniq(layouts);
  }

  return Promise.filter(generatorKeys, function(key){
    return !~excludeGenerator.indexOf(key);
  }).map(function(key){
    var generator = generators[key];
    var start = Date.now();

    return generator.call(ctx, siteLocals, generateRender).then(function(){
      ctx.log.debug('Generator: %s in ' + '%dms'.cyan, key.magenta, Date.now() - start);
    });
  });
};

Theme.prototype.generate = function(options, callback){
  if (!callback && typeof options === 'function'){
    callback = options;
    options = {};
  }

  var ctx = this.context;

  return Promise.all([
    ctx.database.save(),
    this._generate()
  ]).nodeify(callback);
};

Theme.prototype.getView = function(path){
  // Replace backslashes on Windows
  path = path.replace(/\\/g, '/');

  var extname = pathFn.extname(path);
  var name = path.substring(0, path.length - extname.length);
  var views = this.views[name];

  if (!views) return;

  if (extname){
    return views[extname];
  } else {
    return views[Object.keys(views)[0]];
  }
};

Theme.prototype.setView = function(path, data){
  var extname = pathFn.extname(path);
  var name = path.substring(0, path.length - extname.length);
  var views = this.views[name] = this.views[name] || {};

  views[extname] = new this.View(path, data);
};

Theme.prototype.removeView = function(path){
  var extname = pathFn.extname(path);
  var name = path.substring(0, path.length - extname.length);
  var views = this.views[name];

  if (!views) return;

  delete views[extname];
};

module.exports = Theme;