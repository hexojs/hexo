var config = require('./config'),
  log = require('./log'),
  fs = require('graceful-fs'),
  async = require('async'),
  _ = require('underscore'),
  util = require('util'),
  store = {};

exports.init = function(callback){
  async.parallel({
    global: function(next){
      fs.readFile(__dirname + '/../languages/' + config.language + '.json', 'utf8', function(err, file){
        if (err) throw err;
        next(null, JSON.parse(file));
      });
    },
    theme: function(next){
      fs.readFile(__dirname + '/../theme/' + config.theme + '/languages/' + config.language + '.json', 'utf8', function(err, file){
        if (err) throw err;
        next(null, JSON.parse(file));
      });
    }
  }, function(err, results){
    if (err) throw err;
    store = results.global;
    store.theme = results.theme;
    log.info('Localization file loaded.');
    callback();
  })
};

var replaceText = function(string, namespace, args){
  if (store.hasOwnProperty(namespace) && typeof store[namespace][string] !== 'undefined' && store[namespace][string] !== ''){
    string = store[namespace][string];
  } else {
    if (namespace) args.push(namespace);
    if (typeof store[string] !== 'undefined' && store[string] !== ''){
      string = store[string];
    } 
  }
  
  args.unshift(string);
  return util.format.apply(undefined, args);
};

var get = exports.get = function(){
  var args = _.toArray(arguments),
    string = args.shift(),
    namespace = args.pop();

  if (_.isArray(string)){
    if (args.length === 0){
      args.push(namespace);
      namespace = undefined;
    }

    var number = args[0];
    if (string.length === 3){
      if (number > 1){
        string = string[2];
      } else if (number <= 0){
        string = string[0];
        number = undefined;
      } else {
        string = string[1];
      }
    } else {
      string = number > 1 ? string[1] : string[0];
    }

    if (number === undefined){
      args = args.splice(1);
    } else {
      args[0] = number.toString();
    }

    return replaceText(string, namespace, args);
  } else {
    return replaceText(string, namespace, args);
  }
};

exports.update = function(string, value, namespace){
  if (namespace === undefined){
    store[string] = value;
  } else {
    store[namespace][string] = value;
  }
};

exports.destroy = function(string, namespace){
  if (namespace === undefined){
    delete store[string];
  } else {
    delete store[namespace][string];
  }
};

exports.namespace = function(namespace){
  return {
    get: function(){
      var args = _.toArray(arguments);
      args.push(namespace);
      get.apply(undefined, args);
    },
    update: function(string){
      store[namespace][string] = value;
    },
    destroy: function(string){
      delete store[namespace][string];
    }
  }
};