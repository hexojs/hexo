/**
 * Module dependencies.
 */

var _ = require('lodash');

/**
 * Create the object to store all extensions.
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
 * Expose generator.
 *
 * @api public
 */

exports.generator = {

  /**
   * List all generator plugins.
   *
   * @api public
   */

  list: function(){
    return store.generator;
  },

  /**
   * Register a generator plugin.
   *
   * @param {Function} fn
   * @api public
   */

  register: function(fn){
    store.generator.push(fn);
  }
};

/**
 * Expose renderer.
 *
 * @api public
 */

var rendererFn = exports.renderer = {

  /**
   * List all renderer plugins.
   *
   * @api public
   */

  list: function(){
    return store.renderer;
  },

  /**
   * Register a renderer plugin.
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
 * Expose rendererSync.
 *
 * @api public
 */

exports.rendererSync = {

  /**
   * List all synchronous renderer plugins.
   *
   * @api public
   */

  list: function(){
    return store.rendererSync;
  },

  /**
   * Register a synchronous renderer plugin.
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
 * Expose tag.
 *
 * @api public
 */

exports.tag = {

  /**
   * List all tag plugins.
   *
   * @api public
   */

  list: function(){
    return store.tag;
  },

  /**
   * Register a tag plugin.
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
 * Expose deployer.
 *
 * @api public
 */

exports.deployer = {

  /**
   * List all deployer plugins.
   *
   * @api public
   */

  list: function(){
    return store.deployer;
  },

  /**
   * Register a deployer plugin.
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
 * Expose processor.
 *
 * @api public
 */

exports.processor = {

  /**
   * List all processor plugins.
   *
   * @api public
   */

  list: function(){
    return store.processor;
  },

  /**
   * Register a deployer plugin.
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
 * Expose helper.
 *
 * @api public
 */

exports.helper = {

  /**
   * List all helper plugins.
   *
   * @api public
   */

  list: function(){
    return store.helper;
  },

  /**
   * Register a helper plugin.
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
 * Expose console.
 *
 * @api public
 */

exports.console = {

  /**
   * List all console plugins.
   *
   * @api public
   */

  list: function(){
    return store.console;
  },


  /**
   * Register a helper plugin.
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
 * Expose migrator.
 *
 * @api public
 */

exports.migrator = {

  /**
   * List all migrator plugins.
   *
   * @api public
   */

  list: function(){
    return store.migrator;
  },

  /**
   * Register a migrator plugin.
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
 * Expose filter.
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
   * Register a filter plugin.
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
 * Expose swig.
 *
 * @api public
 */

exports.swig = {

  /**
   * List all swig plugins.
   *
   * @api public
   */

  list: function(){
    return store.swig;
  },

  /**
   * Register a swig plugin.
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