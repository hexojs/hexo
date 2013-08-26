var stylus = require('stylus'),
  nib = require('nib'),
  async = require('async'),
  colors = require('colors'),
  file = require('../lib/util').file2;

var assetDir = __dirname + '/../assets/styl/',
  destDir = __dirname + '/../public/css/';

file.list(assetDir, {ignorePattern: /^_|\/_/}, function(err, files){
  if (err) throw err;

  async.forEach(files, function(item, next){
    var src = assetDir + item;

    async.waterfall([
      function(next){
        file.readFile(src, next);
      },
      function(content, next){
        stylus(content)
          .set('filename', src)
          .set('compress', true)
          .use(nib())
          .render(next);
      },
      function(result, next){
        file.writeFile(destDir + item.replace(/\.styl$/, '.css'), result, next);
      }
    ], function(err){
      if (err) throw err;

      console.log('  compiled'.green + ' ' + item);
      next();
    });
  }, function(err){
    if (err) throw err;
  });
});