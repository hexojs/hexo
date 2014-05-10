var renderer = hexo.extend.renderer;

var html = require('./html');

renderer.register('htm', 'html', html, true);
renderer.register('html', 'html', html, true);

renderer.register('swig', 'html', require('./swig'), true);

var yml = require('./yaml');

renderer.register('yml', 'json', yml, true);
renderer.register('yaml', 'json', yml, true);