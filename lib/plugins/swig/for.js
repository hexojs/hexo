var helpers = require('swig/lib/helpers');

module.exports = function(indent, parser){
  var args = this.args,
    name = args[0],
    operator = args[1],
    collection = parser.parseVariable(args[2]);

  var loopShared = [
    'loop.index = __loopIndex + 1;',
    'loop.index0 = __loopIndex;',
    'loop.revindex = __loopLength - loop.index0;',
    'loop.revindex0 = loop.revindex - 1;',
    'loop.first = __loopIndex === 0;',
    'loop.last = __loopIndex === __loopLength - 1;',
    parser.compile.apply(this, [indent])
  ].join('\n');

  var out = [
    '(function(){',
      'var loop = {};',
      'var __loopIndex = 0;',
      'var __loopLength = 0;',
      helpers.setVar('__loopObj', collection),
      'else {',
        'return;',
      '}',
      'if (Array.isArray(__loopObj)){',
        '__loopLength = __loopObj.length;',
        'for (; __loopIndex < __loopLength; __loopIndex++){',
          'loop.key = __loopIndex;',
          '_context["' + name + '"] = __loopObj[__loopIndex];',
          loopShared,
        '}',
      '} else if (typeof __loopObj.forEach === "function"){',
        '__loopLength = __loopObj.length;',
        '__loopObj.forEach(function(item, i){',
          'loop.key = __loopIndex = i;',
          '_context["' + name + '"] = item;',
          loopShared,
        '});',
      '} else if (typeof __loopObj === "object"){',
        '__keys = Object.keys(__loopObj);',
        '__loopLength = __keys.length;',
        'for (; __loopIndex < __loopLength; __loopIndex++){',
          'loop.key = __keys[__loopIndex];',
          '_context["' + name + '"] = __loopObj[loop.key];',
          loopShared,
        '}',
      '}',
    '})();'
  ].join('\n');

  return out;
};