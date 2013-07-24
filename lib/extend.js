/**
 * Module dependencies.
 */

var _ = require('lodash');

/**
 * Stores all extensions.
 */

var store = {
  generator: [],
  renderer: {},
  rendererSync: {},
  helper: {},
  deployer: {},
  processor: [],
  tag: {},
  console: {},
  migrator: {},
  filter: {
    pre: [],
    post: []
  },
  swig: {}
};

/**
 * Exposes generator.
 *
 * @api public
 */

exports.generator = {

  /**
   * Lists all generator plugins.
   *
   * @api public
   */

  list: function(){
    return store.generator;
  },

  /**
   * Registers a generator plugin.
   *
   * @param {Function} fn
   * @api public
   */

  register: function(fn){
    store.generator.push(fn);
  }
};

/**
 * Exposes renderer.
 *
 * @api public
 */

var rendererFn = exports.renderer = {

  /**
   * Lists all renderer plugins.
   *
   * @api public
   */

  list: function(){
    return store.renderer;
  },

  /**
   * Registers a renderer plugin.
   *
   * @param {String} name
   * @param {String} output
   * @param {Function} fn
   * @param {Boolean} sync
   * @api public
   */

  register: function(name, output, fn, sync){
    if (sync){
      store.rendererSync[name] = fn;
      store.rendererSync[name].output = output;

      store.renderer[name] = function(){
        var args = _.toArray(arguments),
          callback = args.pop();

        try {
          callback(null, fn.apply(null, args));
        } catch (err){
          callback(err);
        }
      };
    } else {
      store.renderer[name] = fn;
    }

    store.renderer[name].output = output;
  }
};

/**
 * Exposes rendererSync.
 *
 * @api public
 */

exports.rendererSync = {

  /**
   * Lists all synchronous renderer plugins.
   *
   * @api public
   */

  list: function(){
    return store.rendererSync;
  },

  /**
   * Registers a synchronous renderer plugin.
   *
   * @param {String} name
   * @param {String} output
   * @param {Function} fn
   * @api public
   */

  register: function(name, output, fn){
    rendererFn.register(name, output, fn, true);
  }
};

/**
 * Exposes tag.
 *
 * @api public
 */

exports.tag = {

  /**
   * Lists all tag plugins.
   *
   * @api public
   */

  list: function(){
    return store.tag;
  },

  /**
   * Registers a tag plugin.
   *
   * @param {String} name
   * @param {Function} fn
   * @param {Boolean} ends
   * @api public
   */

  register: function(name, fn, ends){
    store.tag[name] = function(indent, parser){
      var args = this.args,
        tokenArr = this.tokens && this.tokens.length ? this.tokens : [],
        tokens = tokenArr.join(''),
        match = tokenArr.join('').match(/^\n(\t*)/),
        indent = match ? match[1].length : 0,
        raw = [];

      tokens.replace(/^\n\t*/, '').replace(/\n\t*$/, '').split('\n').forEach(function(line){
        if (indent){
          raw.push(line.replace(new RegExp('^\\t{' + indent + '}'), ''));
        } else {
          raw.push(line);
        }
      });

      var content = fn(args, raw.join('\n'));

      if (!content) return '';

      var result = content
        .replace(/\\/g, '\\\\')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/"/g, '\\"');

      var out = [
        '(function(){',
          '_output += "<escape indent=\'' + indent + '\'>' + result + '</escape>";',
        '})();'
      ].join('\n');

      return out;
    };

    if (ends) store.tag[name].ends = true;
  }
};

/**
 * Exposes deployer.
 *
 * @api public
 */

exports.deployer = {

  /**
   * Lists all deployer plugins.
   *
   * @api public
   */

  list: function(){
    return store.deployer;
  },

  /**
   * Registers a deployer plugin.
   *
   * @param {String} name
   * @param {Function} fn
   * @api public
   */

  register: function(name, fn){
    store.deployer[name] = fn;
  }
};

/**
 * Exposes processor.
 *
 * @api public
 */

exports.processor = {

  /**
   * Lists all processor plugins.
   *
   * @api public
   */

  list: function(){
    return store.processor;
  },

  /**
   * Registers a deployer plugin.
   *
   * @param {RegExp|String} rule
   * @param {Function} fn
   * @api public
   */

  register: function(rule, fn){
    if (!_.isFunction(fn)){
      fn = rule;
      rule = '';
    }

    fn.rule = rule;
    store.processor.push(fn);
  }
};

/**
 * Exposes helper.
 *
 * @api public
 */

exports.helper = {

  /**
   * Lists all helper plugins.
   *
   * @api public
   */

  list: function(){
    return store.helper;
  },

  /**
   * Registers a helper plugin.
   *
   * @param {String} name
   * @param {Function} fn
   * @api public
   */

  register: function(name, fn){
    store.helper[name] = fn;
  }
};

/**
 * Exposes console.
 *
 * @api public
 */

exports.console = {

  /**
   * Lists all console plugins.
   *
   * @api public
   */

  list: function(){
    return store.console;
  },


  /**
   * Registers a helper plugin.
   *
   * @param {String} name
   * @param {String} desc
   * @param {Object} options
   * @param {Function} fn
   * @api public
   */

  register: function(name, desc, options, fn){
    if (_.isFunction(options)){
      fn = options;
      options = {};
    }

    if (!_.isObject(options)) options = {};

    var console = store.console[name] = fn;
    console.description = desc;
    console.options = options;
  }
};

/**
 * Exposes migrator.
 *
 * @api public
 */

exports.migrator = {

  /**
   * Lists all migrator plugins.
   *
   * @api public
   */

  list: function(){
    return store.migrator;
  },

  /**
   * Registers a migrator plugin.
   *
   * @param {String} name
   * @param {Function} fn
   * @api public
   */

  register: function(name, fn){
    store.migrator[name] = fn;
  }
};

/**
 * Exposes filter.
 *
 * @api public
 */

exports.filter = {

  /**
   * List all filter plugins.
   *
   * @api public
   */

  list: function(){
    return store.filter;
  },

  /**
   * Registers a filter plugin.
   *
   * @param {String} name
   * @param {Function} fn
   * @api public
   */

  register: function(name, fn){
    if (_.isFunction(name)){
      fn = name;
      name = 'post';
    }

    store.filter[name].push(fn);
  }
};

/**
 * Exposes swig.
 *
 * @api public
 */

exports.swig = {

  /**
   * Lists all swig plugins.
   *
   * @api public
   */

  list: function(){
    return store.swig;
  },

  /**
   * Registers a swig plugin.
   *
   * @param {String} name
   * @param {Function} fn
   * @param {Boolean} ends
   * @api public
   */

  register: function(name, fn, ends){
    store.swig[name] = fn;

    if (ends) store.swig[name].ends = true;
  }
};