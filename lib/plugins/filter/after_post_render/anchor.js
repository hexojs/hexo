'use strict';

const { url_for } = require('hexo-util');
const rAnchorHref = /(?<=<[^>]* href=")#[^"]+(?="[^>]*>)/g;

function prefixAnchor(data) {
  if (!data.path) return;
  data.content = data.content.replace(rAnchorHref, href => url_for.call(this, data.path + href));
}

module.exports = prefixAnchor;
