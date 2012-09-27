var extend = require('../extend');

extend.helper.register('gist', function(indent, parentBlock, parser){
  var args = parser.parseVariable(indent),
    id = args[0],
    name = args[1] ? '?file=' + args[1] : '';

  return '<script src="https://gist.github.com/'+id+'.js'+name+'"></script>'; 
});