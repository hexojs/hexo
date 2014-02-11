var colors = require('colors');

module.exports = function(args, callback){
  var keys = Object.keys(hexo.route.routes);

  if (args.json){
    console.log(keys);
    return callback();
  }

  var routes = {};

  keys.forEach(function(key){
    setProperty(routes, key, {});
  });

  console.log('.'.grey);
  printTree(routes);
  console.log('\nTotal: ' + keys.length);
  callback();
};

var setProperty = function(obj, key, data){
  var split = key.split('/'),
    cursor = obj;

  for (var i = 0, len = split.length - 1; i < len; i++){
    var name = split[i];
    cursor = cursor[name] = cursor[name] || {};
  }

  cursor[split[i]] = data;
};

var printTree = function(obj, indent){
  indent = indent || 0;

  var keys = Object.keys(obj);

  keys.sort(function(a, b){
    if (a < b){
      return -1;
    } else if (a > b){
      return 1;
    } else {
      return 0;
    }
  });

  for (var i = 0, len = keys.length; i < len; i++){
    var key = keys[i],
      child = obj[key],
      childLength = Object.keys(child).length;

    var str = '';

    for (var j = 0; j < indent; j++){
      str += '|   '.grey;
    }

    if (i === len - 1 && !childLength){
      str += '└── '.grey;
    } else {
      str += '├── '.grey;
    }

    str += key;

    if (childLength){
      str += (' (' + childLength + ')').grey;
    }

    console.log(str);

    if (childLength){
      printTree(child, indent + 1);
    }
  }
};