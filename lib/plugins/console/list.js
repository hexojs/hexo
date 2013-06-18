var extend = require('../../extend'),
  route = require('../../route'),
  log = hexo.log;

extend.console.register('list', 'List information', function(args, callback){
  var types = ['category', 'draft', 'page', 'post', 'route', 'tag'],
    type = args._[0];

  if (types.indexOf(type) == -1){
    var help = 'Usage: hexo list <type>\n\n' +
      'Type:\n' +
      '  ' + types.join(', ') + '\n';

    console.log(help);

    return callback();
  }

  log.i('Loading');

  require('../../load')({}, function(err){
    if (err) return callback(err);

    switch (type){
      case 'route':
        var list = Object.keys(route.list()).sort(),
          results = ['Routes:'];

        list.forEach(function(item){
          results.push('- ' + item);
        });

        results.push('TOTAL: ' + list.length);
        log.i(results.join('\n'));

        break;
    }

    callback();
  });
});