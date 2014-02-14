var fs = require('fs'),
  async = require('async'),
  colors = require('colors'),
  path = require('path'),
  moment = require('moment'),
  util = require('../../util'),
  file = util.file2,
  yfm = util.yfm;

var _draftDir = function(){
  return path.join(hexo.source_dir, '_drafts') + path.sep;
};

var _postDir = function(){
  return path.join(hexo.source_dir, '_posts') + path.sep;
};

var _publishPost = function(filename, callback){
  var src = path.join(_draftDir(), filename + '.md'),
    dest = path.join(_postDir(), filename + '.md');

  async.waterfall([
    // Append `date` attribute to the YAML front-matter of file
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

        next(null, newContent);
      });
    },
    // Write the post file
    function(result, next){
      hexo.log.d('Moving the post file to ' + dest);
      file.writeFile(dest, result, next);
    },
    // Clean the draft file
    function(next){
      hexo.log.d('Cleaning up...');
      fs.unlink(src, next);
    }
  ], callback);
};

var _publishAsset = function(filename, callback){
  var src = path.join(_draftDir(), filename),
    dest = path.join(_postDir(), filename);

  async.series([
    // Check existance
    function(next){
      fs.exists(src, function(exist){
        if (exist) return next();

        callback();
      });
    },
    // Copy the directory to _posts folder
    function(next){
      file.copyDir(src, dest, next);
    },
    // Clean the original directory in _drafts folder
    function(next){
      file.rmdir(src, next);
    }
  ], callback);
};

module.exports = function(args, callback) {
  var filename = args._[0] || false;

  if (!filename) {
    hexo.call('help', {_: ['publish']}, callback);
    return;
  }

  var src = path.join(_draftDir(), filename + '.md');

  async.auto({
    exist: function(next){
      fs.exists(src, function(exist){
        if (exist) return next();

        callback('File ' + src + 'does not exist.');
      });
    },
    post: ['exist', function(next){
      _publishPost(filename, next);
    }],
    asset: ['exist', function(next){
      _publishAsset(filename, next);
    }]
  }, function(){
    hexo.log.i('Successfully published ' + src);
    callback();
  });
};