var extend = require('../../extend'),
  compile = require('../../render').compile,
  path = require('path'),
  util = require('../../util'),
  file = util.file;

extend.console.register('render', 'Render a file', {init: true}, function(args, callback){
  var src = args._[0],
    dest = args._[1];

  compile(src, function(err, content, output){
    if (err) throw new Error('Compile Error: ' + src);
    if (!path.extname(dest)) dest += '.' + output;

    file.write(dest, content, function(err){
      if (err) throw new Error('Failed to write file: ' + dest);
      console.log('File rendered at %s', dest.bold);
      callback();
    });
  });
});