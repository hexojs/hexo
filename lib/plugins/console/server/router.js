var _ = require('lodash'),
  singularize = require('../../../util').inflector.singularize;

var Router = module.exports = function(app, path, base, middlewares){
  this.app = app;
  this.path = path || '';
  this.base = base || '';
  this.middlewares = middlewares || [];
};

['get', 'post', 'put', 'del', 'delete', 'all'].forEach(function(i){
  Router.prototype[i] = function(){
    var args = _.toArray(arguments),
      path = args.shift(),
      arr = [],
      self = this;

    args.forEach(function(item){
      if (typeof item === 'string'){
        var actions = item.split('#'),
          fn = require('./controllers/' + self.base + actions.shift());

        actions.forEach(function(act){
          fn = fn[act];
        });

        arr.push(fn);
      } else {
        arr.push(item);
      }
    });

    this.app[i](this.path + path.replace(/\/$/, ''), this.middlewares.concat(arr));
  };
});

Router.prototype.namespace = function(){
  var args = _.toArray(arguments),
    path = args.shift(),
    callback = args.pop();

  callback(new Router(
    this.app,
    this.path + path + '/',
    this.base + path + '/',
    this.middlewares.concat(args)
  ));
};

Router.prototype.resources = function(){
  var args = _.toArray(arguments),
    path = args.shift(),
    self = this,
    callback;

  if (typeof args[args.length - 1] === 'function'){
    callback = args.pop();
  }

  var options = args.pop();

  if (Array.isArray(options)){
    args.push(options);
    options = {};
  }

  if (!_.isObject(options) || Array.isArray(options)){
    options = {};
  }

  var options = _.extend({
    controller: path,
    name: path,
    param: 'id',
    only: ['index', 'new', 'create', 'show', 'edit', 'update', 'destroy'],
    except: []
  }, options);

  var controller = options.controller,
    param = options.param;

  _.difference(options.only, options.exclude).forEach(function(i){
    switch (i){
      case 'index':
        self.get(path + '.:format?', args, controller + '#index');
        break;

      case 'new':
        self.get(path + '/new.:format?', args, controller + '#index');
        break;

      case 'create':
        self.post(path + '.:format?', args, controller + '#create');
        break;

      case 'show':
        self.get(path + '/:' + param + '.:format?', args, controller + '#show');
        break;

      case 'edit':
        self.get(path + '/:' + param + '/edit.:format?', args, controller + '#edit');
        break;

      case 'update':
        self.put(path + '/:' + param + '.:format?', args, controller + '#update');
        break;

      case 'destroy':
        self.del(path + '/:' + param + '.:format?', args, controller + '#destroy');
        break;
    }
  });

  callback && callback(new Router(
    this.app,
    this.path + path + '/:' + singularize(options.name) + '_id/',
    '',
    this.middlewares.concat(args)
  ));
};