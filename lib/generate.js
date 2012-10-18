var extend = require('./extend'),
  generate = extend.generate.list(),
  process = extend.process.list(),
  theme = require('./theme'),
  async = require('async');

var site = {
  posts: new Posts(),
  pages: new Posts(),
  categories: {},
  tags: {}
};

function Posts(arr){
  if (arr){
    var length = this.length = arr.length;

    for (var i=0; i<length; i++){
      this[i] = arr[i];
    }
  } else {
    this.length = 0;
  }

  this.each = this.forEach = function(callback){
    for (var i=0, len=this.length; i<len; i++){
      var _callback = callback(this[i], i);

      if (typeof _callback !== 'undefined'){
        if (_callback){
          continue;
        } else {
          break;
        }
      }
    }
  };

  this.toArray = function(){
    var result = [];

    this.each(function(item){
      result.push(item);
    });

    return result;
  };

  this.slice = function(start, end){
    return new Posts([].slice.apply(this.toArray(), arguments));
  };

  this.skip = function(num){
    return this.slice(num);
  };

  this.limit = function(num){
    return this.slice(0, num);
  };

  this.push = function(item){
    this[this.length] = item;
    this.length++;
  };

  this.sort = function(field, order){
    var arr = this.toArray().sort(function(a, b){
      return a[field] - b[field];
    });

    if (typeof order !== 'undefined' && (order === -1 || order.toLowerCase() === 'desc')){
      arr = arr.reverse();
    };

    return new Posts(arr);
  };

  this.random = function(){
    var arr = this.toArray().sort(function(a, b){
      return Math.random() - 0.5 < 0;
    });

    return new Posts(arr);
  }
};

module.exports = function(){
  var start = new Date();

  async.forEachSeries(process, function(item, next){
    item(site, function(err, locals){
      if (err) throw err;
      if (locals) site = locals;
      next();
    });
  }, function(err){
    if (err) throw err;

    Object.freeze(site);

    async.forEach(generate, function(item, next){
      item(site, function(layout, locals, callback){
        var newLocals = {
          page: locals,
          site: site,
          config: hexo.config,
          theme: theme.config
        };

        theme.render(layout, newLocals, callback);
      }, next);
    }, function(){
      var finish = new Date();
      console.log('Site generated in %d ms.', finish.getTime() - start.getTime());
    });
  });
};