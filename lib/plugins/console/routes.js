var extend = require('../../extend'),
  route = require('../../route');

extend.console.register('routes', 'Display all routes', function(args){
  console.log('Loading.');

  require('../../generate')({rebuild: true}, function(){
    var list = Object.keys(route.list()).sort();

    console.log('\nRoutes:');

    list.forEach(function(key){
      console.log('- ' + key);
    });

    console.log('\nTotal %d routes.\n', list.length);
  });
});