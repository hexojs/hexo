var EventEmitter = require('events').EventEmitter,
  fs = require('graceful-fs'),
  moment = require('moment'),
  path = require('path'),
  util = require('util'),
  colors = require('colors'),
  Log = require('./log'),
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

  var log = this.log = new Log();
  this.route = new Router();

  if (args._test){
    log.setHide(0);
  } else if (debug){
    log.setHide(9);
  } else {
    log.setHide(7);
  }

  if (debug){
    log.setFormat('[:level] ' + ':date[HH:mm:ss]'.grey + ' :message');
  } else {
    log.setFormat('[:level] :message');
  }

  log.setLevel('created', 5, 'green');
  log.setLevel('updated', 5, 'yellow');
  log.setLevel('deleted', 5, 'red');

  log.on('log', function(data){
    if (log.levels[data.level] < log.hide){
      process[data.level === 'error' ? 'stderr' : 'stdout'].write(log.toString(data) + '\n');
    }
  });

  if (debug){
    var now = new Date(),
      logStream = fs.createWriteStream(path.join(baseDir, 'debug (' + now.toISOString() + ').log'));

    var info = [
      'date: ' + moment(now).format('YYYY-MM-DD HH:mm:ss'),
      'version:',
      '  hexo: ' + version
    ];

    var versions = process.versions;

    for (var i in versions){
      info.push('  ' + i + ': ' + versions[i]);
    }

    info.push('---');

    logStream.write(info.join('\n') + '\n\n');

    log.on('log', function(data){
      logStream.write('[' + data.level.toUpperCase() + '] ' + data.date.toISOString() + ' ' + log.trim(data.message) + '\n');
    });
  }

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