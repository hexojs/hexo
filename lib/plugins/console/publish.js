var fs = require('fs'),
  colors = require('colors'),
  log = hexo.log;

module.exports = function(args, callback) {
  var filename = args._[0] || false;

  if (!filename) {
    hexo.call('help', {_: ['publish']}, callback);
    return;
  }

  var draft_path = hexo.source_dir + '_drafts/' + filename + '.md';
  var destination_path = hexo.source_dir + '_posts/' + filename + '.md';

  fs.exists(draft_path, function(exists) {
    if (!exists)
      return callback('File ' + draft_path.inverse + ' does not exists.');

    fs.rename(draft_path, destination_path, function(err) {
      if (err) return callback(err);

      log.i('Successfully published ' + destination_path.inverse);
      callback();
    });
  });
};