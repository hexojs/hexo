var fs = require('graceful-fs'),
  moment = require('moment'),
  path = require('path'),
  util = require('../../util'),
  escape = util.escape;

module.exports = function(data, replace, callback){
  var sourceDir = hexo.source_dir,
    layout = data.layout,
    date = data.date,
    slug = data.slug,
    target = '';

  if (layout === 'page'){
    if (data.path){
      target = path.join(sourceDir, data.path);
    } else {
      target = path.join(sourceDir, slug, 'index.md');
    }
  } else {
    var postDir = path.join(sourceDir, layout === 'draft' ? '_drafts' : '_posts'),
      filename = '';

    if (data.path){
      filename = data.path;
    } else {
      filename = hexo.config.new_post_name.replace(/:(\w+)/g, function(match, name){
        switch (name){
          case 'year':
            return date.year();
          case 'month':
            return date.format('MM');
          case 'i_month':
            return date.format('M');
          case 'day':
            return date.format('DD');
          case 'i_day':
            return date.format('D');
          case 'title':
            return slug;
        }
      });
    }

    target = path.join(postDir, filename);
  }

  if (!path.extname(target)) target += '.md';

  if (replace) return callback(null, target);

  fs.exists(target, function(exist){
    if (!exist) return callback(null, target);

    // If the target exists, check the parent folder and rename the file. e.g. target-1.md
    fs.readdir(path.dirname(target), function(err, files){
      if (err) return callback(err);

      var extname = path.extname(target),
        basename = path.basename(target, extname),
        regex = new RegExp('^' + escape.regex(basename) + '-?(\\d+)?'),
        max = 0;

      files.forEach(function(item){
        var match = path.basename(item, path.extname(item)).match(regex);

        if (match){
          var num = match[1];

          if (num){
            if (num >= max){
              max = parseInt(num, 10) + 1;
            }
          } else {
            if (max === 0){
              max = 1;
            }
          }
        }
      });

      target = target.substring(0, target.length - extname.length) + '-' + max + extname;
      callback(null, target);
    });
  });
};