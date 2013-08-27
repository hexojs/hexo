var tag = hexo.extend.tag;

var blockquote = require('./blockquote');

tag.register('quote', blockquote, true);
tag.register('blockquote', blockquote, true);

var code = require('./code');

tag.register('code', code, true);
tag.register('codeblock', code, true);

tag.register('gist', require('./gist'));

tag.register('iframe', require('./iframe'));

var img = require('./img');

tag.register('img', img);
tag.register('image', img);

var include_code = require('./include_code');

tag.register('include_code', include_code);
tag.register('include-code', include_code);

tag.register('jsfiddle', require('./jsfiddle'));

var link = require('./link');

tag.register('a', link);
tag.register('link', link);
tag.register('anchor', link);

tag.register('pullquote', require('./pullquote'), true);

tag.register('raw', require('./raw'), true);

tag.register('vimeo', require('./vimeo'));

tag.register('youtube', require('./youtube'));