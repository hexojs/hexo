var stripIndent = require('strip-indent');
var swig = require('swig');

function Tag(){
  this.swig = new swig.Swig({
    autoescape: false
  });
}

Tag.prototype.register = function(name, fn, options){
  if (!name) throw new TypeError('name is required');
  if (typeof fn !== 'function') throw new TypeError('fn must be a function');

  if (options == null || typeof options === 'boolean'){
    options = {ends: options};
  }

  function tagCompile(compiler, args, template, parents, options, blockName, noWrap){
    var content = tagCompiler(template, parents, options, blockName);
    var result = fn.call(options.locals, args.join('').trim().split(' '), content);
    if (!result) return '';

    if (noWrap){
      return result;
    } else {
      return '_output += "' + result.replace(/\\/g, '\\\\').replace(/\n|\r/g, '\\n').replace(/"/g, '\\"') + '";';
    }
  }

  this.swig.setTag(name, tagParse, tagCompile, options.ends);
};

function tagCompiler(template, parents, options, blockName){
  var tokens = Array.isArray(template) ? template : template.tokens;
  var result = '';
  var token;

  for (var i = 0, len = tokens.length; i < len; i++){
    token = tokens[i];

    if (typeof token === 'string'){
      result += stripIndent(token);
    } else {
      result += token.compile(
        tagCompiler,
        token.args ? token.args : [],
        token.content ? token.content : [],
        parents,
        options,
        token.name,
        true
      );
    }
  }

  return result;
}

function tagParse(str, line, parser, types, stack, opts){
  // Hack: Don't let Swig parse tokens
  parser.on('*', function(token){
    switch (token.type){
      case types.WHITESPACE:
        token.type = types.STRING;
        this.out.push(whitespace(token.length));
        return true;

      case types.DOTKEY:
        token.type = types.STRING;
        this.out.push('.');
        return true;

      case types.FILTER:
      case types.FILTEREMPTY:
        token.type = types.STRING;
        this.out.push('|' + whitespace(token.length - token.match.length - 1));
        return true;

      case types.COMPARATOR:
      case types.LOGIC:
        token.type = types.UNKNOWN;
        this.out.push(token.match + whitespace(token.length - token.match.length));
        return true;

      case types.FUNCTION:
        token.type = types.UNKNOWN;
        this.out.push(token.match + '(');
        return true;

      case types.FUNCTIONEMPTY:
        token.type = types.UNKNOWN;
        this.out.push(token.match + '()');
        return true;

      default:
        token.type = types.STRING;
        return true;
    }
  });

  return true;
}

function whitespace(len){
  if (!len) return '';

  var result = '';

  for (var i = 0; i < len; i++){
    result += ' ';
  }

  return result;
}

module.exports = Tag;