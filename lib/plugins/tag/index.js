'use strict';

module.exports = function(ctx){
  var tag = ctx.extend.tag;

  var blockquote = require('./blockquote')(ctx);

  tag.register('quote', blockquote, true);
  tag.register('blockquote', blockquote, true);

  var code = require('./code')(ctx);

  tag.register('code', code, true);
  tag.register('codeblock', code, true);

  tag.register('gist', require('./gist'));

  tag.register('iframe', require('./iframe'));

  var img = require('./img');

  tag.register('img', img);
  tag.register('image', img);

  var includeCode = require('./include_code')(ctx);

  tag.register('include_code', includeCode, {async: true});
  tag.register('include-code', includeCode, {async: true});

  tag.register('jsfiddle', require('./jsfiddle'));

  var link = require('./link');

  tag.register('a', link);
  tag.register('link', link);
  tag.register('anchor', link);

  tag.register('post_path', require('./post_path')(ctx));
  tag.register('post_link', require('./post_link')(ctx));

  tag.register('asset_path', require('./asset_path')(ctx));
  tag.register('asset_link', require('./asset_link')(ctx));

  var assetImg = require('./asset_img')(ctx);

  tag.register('asset_img', assetImg);
  tag.register('asset_image', assetImg);

  tag.register('pullquote', require('./pullquote')(ctx), true);

  tag.register('vimeo', require('./vimeo'));

  tag.register('youtube', require('./youtube'));
};