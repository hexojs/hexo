'use strict';

var fs = require('hexo-fs');
var pathFn = require('path');

/**
* Inject tag
*
* Syntax:
*   {% inject path/to/file %}
*/

module.exports = function(ctx) {
  return function injectTag(args) {
    var path = pathFn.join(ctx.source_dir, args[0]);

    // exit if path is not defined
    if (!path) return;

    // check existence, if it does, check there is content, return content
    return fs.exists(path).then(function(exist) {
      if (exist) return fs.readFile(path);
    }).then(function(contents) {
      if (!contents) return;
      return contents;
    });

  };
};
