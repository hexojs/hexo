var renderer = hexo.extend.renderer;

renderer.register('ejs', 'html', require('./ejs'), true);

var html = require('./html');

renderer.register('htm', 'html', html, true);
renderer.register('html', 'html', html, true);

var markdown = require('./markdown');

renderer.register('md', 'html', markdown, true);
renderer.register('markdown', 'html', markdown, true);
renderer.register('mkd', 'html', markdown, true);
renderer.register('mkdn', 'html', markdown, true);
renderer.register('mdwn', 'html', markdown, true);
renderer.register('mdtxt', 'html', markdown, true);
renderer.register('mdtext', 'html', markdown, true);

var styl = require('./stylus');

renderer.register('styl', 'css', styl);
renderer.register('stylus', 'css', styl);

renderer.register('swig', 'html', require('./swig'));

var yml = require('./yaml');

renderer.register('yml', 'json', yml, true);
renderer.register('yaml', 'json', yml, true);