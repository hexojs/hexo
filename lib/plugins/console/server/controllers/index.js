var _ = require('lodash');

var formatPath = function(path){
  return path.replace(/\/*$/, '/');
};

var Controller = module.exports = function(app, base, middlewares){
  this.app = app;
  this.middlewares = middlewares || [];

  if (base){
    this.base = formatPath(base);
  } else {
    this.base = '/';
  }
};

['get', 'post', 'put', 'del', 'use'].forEach(function(i){
  Controller.prototype[i] = function(){
    var args = _.toArray(arguments),
      path = args.shift(),
      arr = [];

    args.forEach(function(item){
      if (typeof item === 'string'){
        var actions = item.split('#'),
          fn = require('./' + actions.shift());

        actions.forEach(function(act){
          fn = fn[act];
        });

        arr.push(fn);
      } else {
        arr.push(item);
      }
    });

    this.app[i](this.base + path.replace(/\/*$/, ''), this.middlewares.concat(arr));
  };
});

Controller.prototype.namespace = function(){
  var args = _.toArray(arguments),
    path = formatPath(args.shift()),
    callback = args.pop();

  callback(new Controller(this.app, this.base + path, this.middlewares.concat(args)));
};

Controller.prototype.resource = function(){
  var args = _.toArray(arguments),
    path = args.shift(),
    options = {},
    middlewares = [],
    controller = path,
    self = this,
    callback;

  if (args.length){
    if (typeof args[args.length - 1] === 'function'){
      callback = args.pop();
    }

    args.forEach(function(item){
      if (typeof item === 'string'){
        controller = item;
      } else if (typeof item === 'function' || Array.isArray(item)){
        middlewares.push(item);
      } else {
        options = item;
      }
    });
  }

  options = _.defaults(options, {
    param: 'id',
    only: ['index', 'new', 'create', 'show', 'edit', 'update', 'destroy'],
    exclude: []
  });

  _.difference(options.only, options.exclude).forEach(function(i){
    switch (i){
      case 'index':
        self.get(path, controller + '#index');
        break;

      case 'new':
        self.get(path + '/new', controller + '#new');
        break;

      case 'create':
        self.post(path, controller + '#create');
        break;

      case 'show':
        self.get(path + '/:' + options.param, controller + '#show');
        break;

      case 'edit':
        self.get(path + '/:' + options.param + '/edit', controller + '#edit');
        break;

      case 'update':
        self.put(path + '/:' + options.param, controller + '#update');
        break;

      case 'destroy':
        self.del(path + '/:' + options.param, controller + '#destroy');
        break;
    }
  });

  callback && callback(new Controller(this.app, this.base + path, this.middlewares.concat(middlewares)));
};