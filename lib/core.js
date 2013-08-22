var EventEmitter = require('events').EventEmitter,
  fs = require('graceful-fs'),
  moment = require('moment'),
  path = require('path'),
  util = require('util'),
  colors = require('colors'),
  os = require('os'),
  Logger = require('./logger'),
  Router = require('./router'),
  Extend = require('./extend'),
  version = require('../package.json').version,
  env = process.env,
  domain;

try {
  domain = require('domain');
} catch (err){
  //
}

var Hexo = module.exports = function(baseDir, args){
  this.config = {};

  this.base_dir = baseDir + path.sep;
  this.public_dir = path.join(baseDir, 'public') + path.sep;
  this.source_dir = path.join(baseDir, 'source') + path.sep;
  this.plugin_dir = path.join(baseDir, 'node_modules') + path.sep;
  this.script_dir = path.join(baseDir, 'scripts') + path.sep;
  this.scaffold_dir = path.join(baseDir, 'scaffolds') + path.sep;

  this.__defineGetter__('theme_dir', function(){
    return path.join(baseDir, 'themes', this.config.theme);
  });

  var debug = this.debug = !!args.debug;
  this.safe = !!args.save;
  this.init = false;
  this.route = new Router();

  // Extend
  var extend = this.extend = new Extend();

  [
    'console',
    'deployer',
    'filter',
    'generator',
    'helper',
    'migrator',
    'processor',
    'renderer',
    'swig',
    'tag'
  ].forEach(function(item){
    extend.module(item, require('./extend/' + item));
  });

  // Logger
  var log = this.log = new Logger({
    levels: {
      created: 5,
      updated: 5,
      deleted: 5
    }
  });

  // Create logger console stream
  var consoleStream = new Logger.stream.Console(log, {
    colors: {
      created: 'green',
      updated: 'yellow',
      deleted: 'red'
    }
  });

  if (debug){
    consoleStream.setFormat('[:level] ' + ':date'.grey + ' :message');
    consoleStream.setHide(9);

    var now = new Date(),
      logPath = path.join(baseDir, 'debug.log');

    // Generate system info
    var content = [
      'date: ' + moment(now).format('YYYY-MM-DD HH:mm:ss'),
      'argv: ' + process.argv.join(' '),
      'os: ' + os.type() + ' ' + os.release() + ' ' + os.platform() + ' ' + os.arch(),
      'version:',
      '  hexo: ' + version
    ];

    var versions = process.versions;

    for (var i in versions){
      content.push('  ' + i + ': ' + versions[i]);
    }

    content.push('---');

    // Create a log file with system info
    fs.writeFile(logPath, content.join('\n') + '\n\n', function(err){
      if (err) throw err;

      // Create logger file stream
      var fileStream = new Logger.stream.File(log, {
        path: logPath,
        hide: 9
      });
    });
  }
};

var proto = Hexo.prototype;

proto.__proto__ = EventEmitter.prototype;

proto.core_dir = path.dirname(__dirname) + path.sep;
proto.lib_dir = __dirname + path.sep;
proto.env = env;
proto.version = version;
proto.util = util;

proto.call = function(name, args, callback){
  if (!callback){
    if (typeof args === 'function'){
      callback = args;
      args = {};
    } else {
      callback = function(){};
    }
  }

  var console = this.extend.console.get(name);

  if (console){
    if (domain){
      var d = domain.create();

      d.on('error', function(err){
        d.dispose();
        callback(err);
      });

      d.run(function(){
        console(args, callback);
      });
    } else {
      try {
        console(args, callback);
      } catch (err){
        callback(err);
      }
    }
  } else {
    callback(new Error('Console `' + name + '` not found'));
  }

  return this;
};