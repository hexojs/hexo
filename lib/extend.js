var _ = require('underscore');

var store = {
  generator: [],
  renderer: {},
  rendererSync: {},
  helper: {}
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
  register: function(tag, method, sync){
    if (sync){
      store.rendererSync[tag] = method;
      store.renderer[tag] = function(){
        var args = _.toArray(arguments),
          callback = args.pop();

        callback(null, method.apply(null, args));
      };
    } else {
      store.renderer[tag] = method;
    }
  }
};

exports.rendererSync = {
  list: function(){
    return store.rendererSync;
  },
  register: function(tag, method){
    rendererFn(tag, method, true);
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

require('./renderer');
require('./generator');
require('./helper');