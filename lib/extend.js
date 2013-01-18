var _ = require('underscore');

var store = {
  generator: [],
  renderer: {},
  rendererSync: {},
  helper: {},
  deployer: {},
  processor: [],
  tag: {},
  console: {},
  migrator: {},
  filter: {}
};

exports.generator = {
  list: function(){
    return store.generator;
  },
  register: function(method){
    store.generator.push(method);
  }
};

var rendererFn = exports.renderer = {
  list: function(){
    return store.renderer;
  },
  register: function(tag, output, method, sync){
    if (sync){
      store.rendererSync[tag] = method;
      store.rendererSync[tag].output = output;

      store.renderer[tag] = function(){
        var args = _.toArray(arguments),
          callback = args.pop();

        callback(null, method.apply(null, args));
      };
    } else {
      store.renderer[tag] = method;
    }

    store.renderer[tag].output = output;
  }
};

exports.rendererSync = {
  list: function(){
    return store.rendererSync;
  },
  register: function(tag, output, method){
    rendererFn(tag, output, method, true);
  }
}

exports.tag = {
  list: function(){
    return store.tag;
  },
  register: function(tag, method, ends){
    store.tag[tag] = function(indent, parentBlock, parser){
      var args = this.args,
        tokens = this.tokens ? this.tokens.join('').replace(/^\n/, '').replace(/\n$/, '') : '';

      var result = method(args, tokens)
        .replace(/\\/g, '\\\\')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/"/g, '\\"');

      return '_output += "' + '<notextile>' + result + '</notextile>' + '";\n';
    };
    if (ends) store.tag[tag].ends = true;
  }
};

exports.deployer = {
  list: function(){
    return store.deployer;
  },
  register: function(tag, method){
    store.deployer[tag] = method;
  }
};

exports.processor = {
  list: function(){
    return store.processor;
  },
  register: function(rule, method){
    if (!_.isFunction(method)){
      method = rule;
      rule = '';
    }

    method.rule = rule;
    store.processor.push(method);
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
  register: function(tag, desc, options, method){
    if (_.isFunction(options)){
      method = options;
      options = {};
    }

    if (!_.isObject(options)) options = {};

    var console = store.console[tag] = method;
    console.description = desc;
    console.options = options;
  }
};

exports.migrator = {
  list: function(){
    return store.migrator;
  },
  register: function(tag, method){
    store.migrator[tag] = method;
  }
};

exports.filter = {
  list: function(){
    return store.filter;
  },
  register: function(tag, method){
    store.filter[tag] = method;
  }
};