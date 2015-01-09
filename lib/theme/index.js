var Promise = require('bluebird');
var pathFn = require('path');
var _ = require('lodash');
var util = require('util');
var Box = require('../box');
var View = require('./view');
var chalk = require('chalk');
var prettyHrtime = require('pretty-hrtime');
var i18n = require('hexo-i18n');

function Theme(ctx){
  Box.call(this, ctx, ctx.theme_dir);

  this.config = {};

  this.views = {};

  this.i18n = new i18n({
    languages: ctx.config.language
  });

  this.processors = [
    require('./processors/config'),
    require('./processors/i18n'),
    require('./processors/source'),
    require('./processors/view')
  ];

  this.isGenerating = false;

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
  if (this.isGenerating) return;

  options = options || {};
  this.isGenerating = true;

  var ctx = this.context;
  var config = ctx.config;
  var siteLocals = _.clone(ctx.locals);
  var generators = ctx.extend.generator.list();
  var route = ctx.route;
  var keys = Object.keys(generators);
  var self = this;
  var routeList = route.list();
  var log = ctx.log;
  var i18n = this.i18n;
  var newRouteList = [];

  ctx.emit('generateBefore');

  function Locals(path, locals){
    locals = this.page = _.extend({
      path: path
    }, locals);

    this.path = path;
    this.url = config.url + config.root + path;

    // TODO: A better way to look up languages
    this.__ = i18n.__(locals.lang);
    this._p = i18n._p(locals.lang);
  }

  Locals.prototype.site = siteLocals;
  Locals.prototype.config = config;
  Locals.prototype.theme = _.extend({}, config, this.config, config.theme_config);
  Locals.prototype._ = _;
  Locals.prototype.layout = 'layout';
  Locals.prototype.cache = !options.watch;
  Locals.prototype.env = ctx.env;
  Locals.prototype.view_dir = pathFn.join(ctx.theme_dir, 'layout') + pathFn.sep;

  return Promise.reduce(keys, function(result, key){
    var generator = generators[key];
    var start = process.hrtime();

    return generator.call(ctx, siteLocals).then(function(data){
      var interval = prettyHrtime(process.hrtime(start));

      log.debug('Generator in %s: %s', chalk.cyan(interval), chalk.magenta(key));

      return data ? result.concat(data) : data;
    });
  }, []).each(function(item){
    if (item.path == null) return;

    var path = route.format(item.path);
    var data = item.data;
    var layout = item.layout;

    newRouteList.push(path);

    if (layout){
      if (!Array.isArray(layout)) layout = [layout];
      layout = _.uniq(layout);

      var locals = new Locals(path, data);
      var layoutLength = layout.length;

      route.set(path, function(){
        var view, name;

        for (var i = 0; i < layoutLength; i++){
          name = layout[i];
          view = self.getView(name);

          if (view){
            log.debug('Rendering %s: %s', name, chalk.magenta(path));
            return view.render(locals);
          }
        }

        log.warn('No layout: %s', chalk.magenta(path));
      });
    } else if (data){
      route.set(path, data);
    }
  }).then(function(){
    var removed = _.difference(routeList, newRouteList);

    for (var i = 0, len = removed.length; i < len; i++){
      route.remove(removed[i]);
    }

    ctx.emit('generateAfter');
  }).finally(function(){
    self.isGenerating = false;
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
    this._generate(options)
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