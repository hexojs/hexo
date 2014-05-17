var tag = hexo.extend.tag;

var blockquote = require('./blockquote');

tag.register('quote', blockquote, {ends: true, escape: false});
tag.register('blockquote', blockquote, {ends: true, escape: false});

var code = require('./code');

tag.register('code', code, true);
tag.register('codeblock', code, true);

tag.register('gist', require('./gist'));

tag.register('iframe', require('./iframe'));

var img = require('./img');

tag.register('img', img, {escape: false});
tag.register('image', img, {escape: false});

var include_code = require('./include_code');

tag.register('include_code', include_code);
tag.register('include-code', include_code);

tag.register('jsfiddle', require('./jsfiddle'));

var link = require('./link');

tag.register('a', link, {escape: false});
tag.register('link', link, {escape: false});
tag.register('anchor', link, {escape: false});

tag.register('pullquote', require('./pullquote'), {ends: true, escape: false});

tag.register('rawblock', require('./raw'), true);

tag.register('vimeo', require('./vimeo'));

tag.register('youtube', require('./youtube'));