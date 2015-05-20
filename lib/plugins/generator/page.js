'use strict';

var minimatch = require('minimatch');
var _ = require('lodash');

function pageGenerator(locals){
  /* jshint validthis: true */
  var skipRender = this.config.skip_render || [];
  if (!Array.isArray(skipRender)) skipRender = [skipRender];
  skipRender = _.compact(skipRender);

  var skipRenderLen = skipRender.length;

  function isSkipRender(path){
    if (!skipRenderLen) return false;

    for (var i = 0; i < skipRenderLen; i++){
      if (minimatch(path, skipRender[i])) return true;
    }

    return false;
  }

  return locals.pages.map(function(page){
    var layout = page.layout;
    var path = page.path;

    if (isSkipRender(page.source)){
      return {
        path: page.source,
        data: page.raw
      };
    } else if (!layout || layout === 'false'){
      return {
        path: path,
        data: page.content
      };
    } else {
      var layouts = ['page', 'post', 'index'];
      if (layout !== 'page') layouts.unshift(layout);

      return {
        path: path,
        layout: layouts,
        data: _.extend({
          __page: true
        }, page)
      };
    }
  });
}

module.exports = pageGenerator;