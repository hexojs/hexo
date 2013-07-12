var _ = require('lodash');

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
  filter: {
    pre: [],
    post: []
  },
  swig: {}
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

        try {
          callback(null, method.apply(null, args));
        } catch (err){
          callback(err);
        }
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
    rendererFn.register(tag, method, true);
  }
}

exports.tag = {
  list: function(){
    return store.tag;
  },
  register: function(tag, method, ends){
    store.tag[tag] = function(indent, parser){
      var args = this.args,
        tokens = this.tokens ? this.tokens.join('') : '',
        indent = this.tokens.join('').match(/^\n(\t*)/)[1].length,
        raw = [];

      tokens.replace(/^\n\t*/, '').replace(/\n\t*$/, '').split('\n').forEach(function(line){
        if (indent){
          raw.push(line.replace(new RegExp('^\\t{' + indent + '}'), ''));
        } else {
          raw.push(line);
        }
      });

      var content = method(args, raw.join('\n'));

      if (!content) return '';

      var result = content
        .replace(/\\/g, '\\\\')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/"/g, '\\"');

      var out = [
        '(function(){',
          '_output += "<escape indent=\'' + indent + '\'>' + result + '</escape>";',
        '})();'
      ].join('\n');

      return out;
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
    if (_.isFunction(tag)){
      method = tag;
      tag = 'post';
    }

    store.filter[tag].push(method);
  }
};

exports.swig = {
  list: function(){
    return store.swig;
  },
  register: function(tag, method, ends){
    store.swig[tag] = method;

    if (ends) store.swig[tag].ends = true;
  }
};