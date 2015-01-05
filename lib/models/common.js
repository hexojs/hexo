var util = require('hexo-util');
var vm = require('vm');
var swigFilters = require('swig/lib/filters');
var swigUtils = require('swig/lib/utils');
var swigParser = require('swig/lib/parser');

var moreTag = '<a id="more"></a>';
var moreTagLength = moreTag.length;
var rExcerpt = new RegExp(util.escape.regex(moreTag));

function efn(){
  return '';
}

exports.renderContent = function(swig, data){
  // Swig.render extends the options which will cause "Maximum call stack size
  // exceeded" error. I try to build a own compiler instead.
  // Based on: https://github.com/paularmstrong/swig/blob/v1.4.2/lib/swig.js#L485
  var src = data._content;
  var tokens = swig.parse(src);

  var options = {
    filename: data.source,
    locals: data
  };

  var sandbox = {
    _swig: swig,
    _ctx: {},
    _filters: swigFilters,
    _utils: swigUtils,
    _fn: efn,
    _output: '',
    _ext: swig.extensions
  };

  // EXPERIMENTAL: run swig in a new context
  // I don't use `new Function()` here because it's a form of eval and will cause
  // lint error. But I don't know whether vm is slower or not.
  vm.runInNewContext(swigParser.compile(tokens, [], options), sandbox);

  return sandbox._output.trim();
};

exports.getExcerpt = function(content){
  if (rExcerpt.test(content)){
    var pos = content.match(rExcerpt).index;
    return content.substring(0, pos).trim();
  } else {
    return '';
  }
};

exports.getMore = function(content){
  if (rExcerpt.test(content)){
    var pos = content.match(rExcerpt).index;
    return content.substring(pos + moreTagLength).trim();
  } else {
    return content;
  }
};