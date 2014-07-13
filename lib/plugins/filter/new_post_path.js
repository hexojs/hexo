var fs = require('graceful-fs'),
  moment = require('moment'),
  path = require('path'),
  _ = require('lodash'),
  util = require('../../util'),
  escape = util.escape,
  Permalink = util.permalink,
  permalink;

var reservedKeys = ['year', 'month', 'i_month', 'day', 'i_day', 'title'];

module.exports = function(data, replace, callback){
  var sourceDir = hexo.source_dir,
    config = hexo.config,
    newPostName = config.new_post_name,
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
  } else if (layout === 'draft'){
    target = path.join(sourceDir, '_drafts', data.path || (slug + path.extname(newPostName)));
  } else {
    var postDir = path.join(sourceDir, '_posts'),
      filename = '';

    if (data.path){
      filename = data.path;
    } else {
      if (!permalink || permalink.rule !== newPostName){
        permalink = new Permalink(newPostName);
      }

      var filenameData = {
        year: date.format('YYYY'),
        month: date.format('MM'),
        i_month: date.format('M'),
        day: date.format('DD'),
        i_day: date.format('D'),
        title: slug
      };

      var keys = Object.keys(data);

      for (var i = 0, len = keys.length; i < len; i++){
        var key = keys[i];
        if (~reservedKeys.indexOf(key)) continue;

        filenameData[key] = data[key];
      }

      filename = permalink.stringify(_.extend({}, config.permalink_defaults, filenameData));
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