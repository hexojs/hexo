var stripIndent = require('strip-indent');
var swig = require('swig');

var placeholder = String.fromCharCode(65535);
var rPlaceholder = new RegExp(placeholder + '(\\d+)' + placeholder, 'g');

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

  this.swig.setTag(name, tagParse, tagCompile(fn, options));
};

function tagParse(str, line, parser, types, stack, opts){
  // Hack: Don't let Swig parse tokens
  parser.on('*', function(token){
    var prevToken = this.prevToken,
      prevTokenType = prevToken ? prevToken.type : 0,
      isString = true;

    switch (token.type){
      case types.WHITESPACE:
        for (var i = 0, len = token.length; i < len; i++){
          this.out.push(' ');
        }

        break;

      case types.DOTKEY:
        this.out.push('.');
        break;

      case types.FILTER:
      case types.FILTEREMPTY:
        this.out.push('| ');
        break;

      case types.COMPARATOR:
      case types.LOGIC:
        isString = false;
        break;

      case types.FUNCTION:
        isString = false;
        token.type = types.UNKNOWN;
        this.out.push(token.match + '(');
        break;

      case types.FUNCTIONEMPTY:
        isString = false;
        token.type = types.UNKNOWN;
        this.out.push(token.match + '()');
        break;
    }

    switch (prevTokenType){
      case types.COMPARATOR:
      case types.LOGIC:
        this.out.push(' ');
        break;
    }

    if (isString){
      token.type = types.STRING;
    }

    return true;
  });
}

function tagCompile(fn, options){
  return function(compiler, args, content, parents, opts, blockName){
    var tmp = {};
    var out = '(function(){';

    content = content.map(function(line, i){
      if (line.compile){
        tmp[i] = line;
        return placeholder + i + placeholder;
      } else {
        return stripIndent(line).replace(/^\n|\n$/g, ''); // Remove prefixing and trailing `\n`
      }
    });

    var result = fn(args.join('').split(' '), content.join(''), opts);
    if (!result) return '';

    result = result
      .replace(/\\/g, '\\\\')
      .replace(/\n|\r/g, '\\n')
      .replace(/"/g, '\\"');

    if (options.escape){
      out += '_output += "<escape>' + result + '<escape>"';
    } else {
      out += '_output += "' + result + '";';
    }

    out = out.replace(rPlaceholder, function(){
      var line = tmp[arguments[1]];
      var result = line.compile(compiler, line.args, line.content, parents, opts, line.name);
      if (!result) return '';

      return '";})();' + result + '(function(){_output += "';
    });

    return out;
  };
}

module.exports = Tag;