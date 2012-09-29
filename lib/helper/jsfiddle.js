var extend = require('../extend');

extend.helper.register('jsfiddle', function(args, content){
  var id = args[0],
    tabs = args[1] ? args[1] : 'js,resources,html,css,result',
    skin = args[2] ? args[2] : 'light',
    height = args[3] ? args[3] : '100%',
    width = args[4] ? args[4] : '300px';

  return '<iframe style="height: '+height+'; width: '+width+';" src="http://jsfiddle.net/'+id+'/embedded/'+tabs+'/'+skin+'"></iframe>';
});