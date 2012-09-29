var store = {
  generator: [],
  renderer: {},
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

exports.renderer = {
  list: function(){
    return store.renderer;
  },
  register: function(tag, method){
    store.renderer[tag] = method;
  }
};

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