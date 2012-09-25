var extend = require('../extend');

extend.render.register('jsfiddle', function(id, tabs, skin, height, width){
  if (tabs === undefined) tabs = 'js,resources,html,css,result';
  if (skin === undefined) skin = 'light';
  if (height === undefined) height = '100%';
  if (width === undefined) width = '300px';

  return '<iframe style="height: '+height+'; width: '+width+';" src="http://jsfiddle.net/'+id+'/embedded/'+tabs+'/'+skin+'"></iframe>';
});