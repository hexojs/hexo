var _ = require('underscore');

var store = {
  global: {}
};

var fetch = function(obj, str){
  if (!store.hasOwnProperty(obj)){
    obj = 'global';
  }

  if (store[obj].hasOwnProperty(str)){
    return store[obj][str];
  } else {
    return str;
  }
};

var ns = exports.namespace = new function(namespace){
  return {
    get: function(){
      var args = _.toArray(arguments),
        str = args.shift();

      if (_.isArray(str)){
        var number = parseInt(args[0], 10),
          strLen = str.length;

        if (number > 1){
          var mainStr = fetch(namespace, str[strLen - 1]);
        } else if (number === 0){
          var mainStr = fetch(namespace, str[0]);
        } else {
          if (strLen > 2){
            var mainStr = fetch(namespace, str[1]);
          } else {
            var mainStr = fetch(namespace, str[0]);
          }
        }

        args[0] = args[0].toString();
      } else {
        var mainStr = fetch(namespace, str);
      }

      return util.format(null, args.unshift(mainStr));
    },
    set: function(str, result){
      if (!store.hasOwnProperty(namespace)) store[namespace] = {};
      store[namespace][str] = result;
    }
  }
};

exports.get = ns(global).get;
exports.set = ns(global).set;