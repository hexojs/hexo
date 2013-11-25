var fs = require('fs'),
  async = require('async'),
  colors = require('colors'),
  path = require('path'),
  moment = require('moment'),
  util = require('../../util'),
  file = util.file2,
  yfm = util.yfm;

module.exports = function(args, callback) {
  var filename = args._[0] || false;

  if (!filename) {
    hexo.call('help', {_: ['publish']}, callback);
    return;
  }

  var sourceDir = hexo.source_dir,
    src = path.join(sourceDir, '_drafts', filename + '.md'),
    dest = path.join(sourceDir, '_posts', filename + '.md');

  async.waterfall([
    // Checks file exists or not
    function(next){
      fs.exists(src, function(exist){
        if (exist) return next();

        callback('File ' + src + ' does not exist.');
      });
    },
    // Appends `date` attribute to the YAML front-matter of file
    function(next){
      file.readFile(src, function(err, result){
        if (err) return next(err);

        var data = yfm(result);

        if (data.date){
          hexo.log.d('This post already has the `date` attribute.');
          return next(null, result);
        }

        var split = result.replace(/^-{3}/, '').split('---'),
          date = 'date: ' + moment().format('YYYY-MM-DD HH:mm:ss') + '\n';

        if (split.length === 1){
          split.unshift(date);
        } else {
          split[0] += date;
        }

        var newContent = split.join('---');

        hexo.log.d([
          'The `date` attribute is added to the post.',
          '',
          'Raw:'.red,
          result.grey,
          '',
          'New:'.green,
          newContent.grey,
          ''
        ].join('\n'));

        next(null, newContent);
      });
    },
    // Writes the post file
    function(result, next){
      hexo.log.d('Moving the post file to ' + dest);
      file.writeFile(dest, result, next);
    },
    // Cleans the draft file
    function(next){
      hexo.log.d('Cleaning up...');
      fs.unlink(src, next);
    }
  ], function(err){
    if (err) return callback(err);

    hexo.log.i('Successfully published ' + src);
    callback();
  });
};