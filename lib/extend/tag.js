'use strict';

var stripIndent = require('strip-indent');
var nunjucks = require('nunjucks');
var inherits = require('util').inherits;
var Promise = require('bluebird');

function Tag(){
  this.env = new nunjucks.Environment(null, {
    autoescape: false
  });
}

Tag.prototype.register = function(name, fn, options){
  if (!name) throw new TypeError('name is required');
  if (typeof fn !== 'function') throw new TypeError('fn must be a function');

  if (options == null || typeof options === 'boolean'){
    options = {ends: options};
  }

  var tag;

  if (options.async){
    if (fn.length > 2){
      fn = Promise.promisify(fn);
    } else {
      fn = Promise.method(fn);
    }

    if (options.ends){
      tag = new NunjucksAsyncBlock(name, fn);
    } else {
      tag = new NunjucksAsyncTag(name, fn);
    }
  } else {
    if (options.ends){
      tag = new NunjucksBlock(name, fn);
    } else {
      tag = new NunjucksTag(name, fn);
    }
  }

  this.env.addExtension(name, tag);
};

Tag.prototype.render = function(str, options, callback){
  if (!callback && typeof options === 'function'){
    callback = options;
    options = {};
  }

  var env = this.env;

  return new Promise(function(resolve, reject){
    env.renderString(str, options, function(err, result){
      if (err) return reject(err);
      resolve(result);
    });
  });
};

function NunjucksTag(name, fn){
  this.tags = [name];
  this.fn = fn;
}

NunjucksTag.prototype.parse = function(parser, nodes, lexer){
  var node = this._parseArgs(parser, nodes, lexer);

  return new nodes.CallExtension(this, 'run', node, []);
};

NunjucksTag.prototype._parseArgs = function(parser, nodes, lexer){
  var tag = parser.nextToken();
  var node = new nodes.NodeList(tag.lineno, tag.colno);
  var args = [];
  var token;

  while ((token = parser.nextToken(true)) && token.type !== lexer.TOKEN_BLOCK_END){
    args += token.value;
  }

  node.addChild(new nodes.Literal(token.lineno, token.colno, args.trim()));

  return node;
};

NunjucksTag.prototype.run = function(context, args){
  return this._run(context, args, '');
};

NunjucksTag.prototype._run = function(context, args, body){
  return this.fn.call(context.ctx, args.split(' '), body);
};

function NunjucksBlock(name, fn){
  NunjucksTag.call(this, name, fn);
}

inherits(NunjucksBlock, NunjucksTag);

NunjucksBlock.prototype.parse = function(parser, nodes, lexer){
  var node = this._parseArgs(parser, nodes, lexer);
  var body = this._parseBody(parser, nodes, lexer);

  return new nodes.CallExtension(this, 'run', node, [body]);
};

NunjucksBlock.prototype._parseBody = function(parser, nodes, lexer){
  var body = parser.parseUntilBlocks('end' + this.tags[0]);

  parser.advanceAfterBlockEnd();
  return body;
};

NunjucksBlock.prototype.run = function(context, args, body){
  return this._run(context, args, trimBody(body));
};

function trimBody(body){
  return stripIndent(body()).trim();
}

function NunjucksAsyncTag(name, fn){
  NunjucksTag.call(this, name, fn);
}

inherits(NunjucksAsyncTag, NunjucksTag);

NunjucksAsyncTag.prototype.parse = function(parser, nodes, lexer){
  var node = this._parseArgs(parser, nodes, lexer);

  return new nodes.CallExtensionAsync(this, 'run', node, []);
};

NunjucksAsyncTag.prototype.run = function(context, args, callback){
  return this._run(context, args, '').then(function(result){
    callback(null, result);
  }, callback);
};

function NunjucksAsyncBlock(name, fn){
  NunjucksBlock.call(this, name, fn);
}

inherits(NunjucksAsyncBlock, NunjucksBlock);

NunjucksAsyncBlock.prototype.parse = function(parser, nodes, lexer){
  var node = this._parseArgs(parser, nodes, lexer);
  var body = this._parseBody(parser, nodes, lexer);

  return new nodes.CallExtensionAsync(this, 'run', node, [body]);
};

NunjucksAsyncBlock.prototype.run = function(context, args, body, callback){
  return this._run(context, args, trimBody(body)).then(function(result){
    callback(null, result);
  }, callback);
};

module.exports = Tag;