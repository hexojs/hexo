var extend = require('../extend'),
  list = extend.migrator.list();

extend.console.register('migrate', 'Migrate from other system', function(args){
  var type = args.shift();

  if (!type || !list[type]){
    var help = '\nUsage: hexo migrate <type>\n\n',
      types = Object.keys(list);

    if (types.length){
      help += 'Type:\n  ' + Object.keys(list).join(', ');
    } else {
      help += 'You should install migrator plugin first!';
    }

    console.log(help + '\n\nMore info: http://zespia.tw/hexo/docs/migrate.html\n');
  } else {
    list[type](args);
  }
});