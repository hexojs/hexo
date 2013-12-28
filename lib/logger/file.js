var moment = require('moment'),
  fs = require('graceful-fs'),
  Stream = require('./stream'),
  os = require('os');

/**
* File stream.
*
* @class File
* @param {Logger} logger
* @param {Object} options
* @constructor
* @extends Hexo.Logger.Stream
* @namespace Hexo.Logger.Stream
* @module hexo
*/

var File = module.exports = function(logger, options){
  if (!options.path) throw new Error('options.path is not defined');

  options = options || {};

  Stream.call(this, logger, options);

  this.format = options.format || '[:level] :date :message';
  var stream = this.stream = fs.createWriteStream(options.path, {flags: 'a'});

  stream.on('error', function(err){
    if (err) throw err;
  });
};

File.prototype.__proto__ = Stream.prototype;

/**
* Writes file to process stream.
*
* @method _write
* @param {Object} data
* @private
*/

File.prototype._write = function(data){
  this.stream.write(toString(this.format, data) + '\n');
};

/**
* Converts data to a string.
*
* @method toString
* @param {String} format
* @param {Object} data
* @private
*/

var toString = function(format, data){
  if (data.error){
    var err = data.error,
      message = err.name + ': ' + err.message + '\n' + err.stack + '\n' + data.message.replace(/\u001b\[(\d+(;\d+)*)?m/g, '');
  } else {
    var message = data.message;
  }

  return format
    .replace(/:level/g, data.level)
    .replace(/:message/g, message.replace(/\u001b\[(\d+(;\d+)*)?m/g, ''))
    .replace(/:date(\[(.+)\])?/g, function(){
      var format = arguments[2] || 'HH:mm:ss.SSS';

      return moment(data.date).format(format);
    });
};

/**
* Sets format.
*
* @method setFormat
* @param {String} format
* @chainable
*/

File.prototype.setFormat = function(format){
  this.format = format;

  return this;
};

/**
* Prepares starting file stream.
*
* @method prepare
* @param {String} path
* @param {Function} callback
* @static
*/

var prepare = File.prepare = function(path, callback){
  var content = [
    'date: ' + moment().format('YYYY-MM-DD HH:mm:ss.SSS'),
    'argv: ' + process.argv.join(' '),
    'os: ' + os.type() + ' ' + os.release() + ' ' + os.platform() + ' ' + os.arch(),
    'version:',
    '  hexo: ' + hexo.version
  ];

  var versions = process.versions;

  for (var i in versions){
    content.push('  ' + i + ': ' + versions[i]);
  }

  content.push('---');

  hexo.file.writeFile(path, content.join('\n') + '\n\n', callback);
};

/**
* Dumps all logs to the file.
*
* @method dump
* @param {String} path
* @param {Hexo.Logger} log
* @param {Function} callback
* @static
*/

File.dump = function(path, log, callback){
  prepare(path, function(err){
    if (err) return callback(err);

    var content = [];

    log.store.forEach(function(item){
      content.push(toString('[:level] :date :message', item));
    });

    hexo.file.appendFile(path, content.join('\n'), callback);
  });
};