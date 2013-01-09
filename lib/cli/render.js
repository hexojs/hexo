var extend = require('../extend'),
  compile = require('../render').compile,
  path = require('path'),
  util = require('../util'),
  file = util.file;

extend.console.register('render', 'Render a file', function(args){
  var src = args[0],
    dest = args[1],
    start = new Date();

  console.log('Rendering.');

  compile(src, function(err, content, output){
    if (err) throw new Error('Compile Error: ' + src);
    if (!path.extname(dest)) dest += '.' + output;

    file.write(dest, content, function(err){
      if (err) throw new Error('I/O Error: ' + dest);

      var finish = new Date(),
        elapsed = (finish.getTime() - start.getTime()) / 1000;

      console.log('File rendered in %ss.', elapsed.toFixed(3));
    });
  });
});