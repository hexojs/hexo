var extend = require('../extend'),
  route = require('../route'),
  util = require('../util'),
  file = util.file,
  async = require('async'),
  publicDir = hexo.public_dir;

extend.console.register('generate', 'Generate static files', function(args){
  args = args.join().toLowerCase();

  var ignoreTheme = args.match(/-t|--theme/i) ? true : false,
    start = new Date();

  require('../generate')({ignore: ignoreTheme}, function(){
    var list = route.list();

    console.log('Generating.');

    async.forEach(Object.keys(list), function(key, next){
      list[key](function(err, result){
        if (err) throw err;

        if (result.readable){
          file.copy(result.path, publicDir + result.source, next);
        } else {
          file.write(publicDir + key, result, next);
        }
      });
    }, function(err){
      if (err) throw err;

      var finish = new Date(),
        elapsed = (finish.getTime() - start.getTime()) / 1000;
      console.log('Site generated in %ss.', elapsed.toFixed(3));
    });
  });
});