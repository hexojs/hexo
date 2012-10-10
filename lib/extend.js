var _ = require('underscore');

var store = {
  generator: [],
  renderer: {},
  rendererSync: {},
  helper: {},
  preprocessor: [],
  tag: {}
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

exports.helper = {
  list: function(){
    return store.helper;
  },
  register: function(tag, method, ends){
    store.helper[tag] = function(indent, parentBlock, parser){
      var args = this.args,
        tokens = this.tokens.join('');

      var result = method(args, tokens)
        .replace(/\\/g, '\\\\')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/"/g, '\\"');

      return '_output += "' + result + '";\n';
    };
    if (ends) store.helper[tag].ends = true;
  }
};

exports.preprocessor = {
  list: function(){
    return store.preprocessor;
  },
  register: function(method){
    store.generator.push(method);
  }
};

exports.tag = {
  list: function(){
    return store.tag;
  },
  register: function(tag, method){
    store.tag[tag] = method;
  }
};

require('./renderer');
require('./generator');
require('./helper');