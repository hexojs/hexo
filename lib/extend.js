var _ = require('underscore');

var store = {
  generate: [],
  render: {},
  renderSync: {},
  helper: {},
  deploy: {},
  process: [],
  tag: {},
  console: {},
  middleware: []
};

exports.generate = {
  list: function(){
    return store.generate;
  },
  register: function(method){
    store.generate.push(method);
  }
};

var renderFn = exports.render = {
  list: function(){
    return store.render;
  },
  register: function(tag, output, method, sync){
    if (sync){
      store.renderSync[tag] = method;
      store.renderSync[tag].output = output;
      
      store.render[tag] = function(){
        var args = _.toArray(arguments),
          callback = args.pop();

        callback(null, method.apply(null, args));
      };
    } else {
      store.render[tag] = method;
    }

    store.render[tag].output = output;
  }
};

exports.renderSync = {
  list: function(){
    return store.renderSync;
  },
  register: function(tag, output, method){
    renderFn(tag, output, method, true);
  }
}

exports.tag = {
  list: function(){
    return store.tag;
  },
  register: function(tag, method, ends){
    store.tag[tag] = function(indent, parentBlock, parser){
      var args = this.args,
        tokens = this.tokens.join('');

      var result = method(args, tokens)
        .replace(/\\/g, '\\\\')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/"/g, '\\"');

      return '_output += "' + result + '";\n';
    };
    if (ends) store.tag[tag].ends = true;
  }
};

exports.deploy = {
  list: function(){
    return store.deploy;
  },
  register: function(tag, method){
    store.deploy[tag] = method;
  }
};

exports.process = {
  list: function(){
    return store.process;
  },
  register: function(method){
    store.process.push(method);
  }
};

exports.helper = {
  list: function(){
    return store.helper;
  },
  register: function(tag, method){
    store.helper[tag] = method;
  }
};

exports.console = {
  list: function(){
    return store.console;
  },
  register: function(tag, desc, method){
    store.console[tag] = method;
    store.console[tag].description = desc;
  }
};

exports.middleware = {
  list: function(){
    return store.middleware;
  },
  register: function(method){
    store.middleware(method);
  }
};

require('./renderer');
require('./generator');
require('./tag');
require('./deploy');
require('./cli');
require('./process');