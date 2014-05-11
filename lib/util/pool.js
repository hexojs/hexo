var child_process = require('child_process'),
  cpus = require('os').cpus().length,
  nextTick;

if (setImmediate != null){
  nextTick = function(fn){
    setImmediate(fn);
  };
} else {
  nextTick = function(fn){
    process.nextTick(fn);
  };
}

/**
* Thread pool.
*
* @class Pool
* @param {String} worker
* @param {Number} [concurrency] Default to the number of CPUs.
* @namespace util
* @constructor
* @module hexo
*/

var Pool = module.exports = function Pool(worker, concurrency){
  /**
  * Tasks.
  *
  * @property tasks
  * @type Array
  * @private
  */

  this.tasks = [];

  /**
  * Workers.
  *
  * @property workers
  * @type Array
  * @private
  */

  this.workers = [];

  /**
  * Concurrency.
  *
  * @property concurrency
  * @type Number
  */

  this.concurrency = concurrency || cpus;

  /**
  * This function is invoked when the last task in the pool is done.
  *
  * @property drain
  * @type Function
  */

  this.drain = function(){};

  /**
  * This function is invoked when the number of pending tasks equals to the concurrency of the pool.
  *
  * @property saturated
  * @type Function
  */

  this.saturated = function(){};

  /**
  * This function is invoked when the last task in the pool is started.
  *
  * @property empty
  * @type Function
  */

  this.empty = function(){};

  for (var i = 0; i < this.concurrency; i++){
    this.workers.push(child_process.fork(worker));
  }
};

/**
* Inserts a task to the pool.
*
* @method _insert
* @param {Array|Object} tasks
* @param {Boolean} first
* @param {Function} [callback]
* @private
*/

Pool.prototype._insert = function(tasks, first, callback){
  if (!Array.isArray(tasks)) tasks = [tasks];

  var self = this;

  tasks.forEach(function(task){
    var item = {
      data: task,
      callback: typeof callback === 'function' ? callback : function(){}
    };

    if (first){
      self.tasks.unshift(item);
    } else {
      self.tasks.push(item);
    }

    if (self.tasks.length === self.concurrency){
      self.saturated();
    }

    nextTick(function(){
      self.process();
    });
  });
};

/**
* Starts distributing tasks to each worker.
*
* @method process
* @private
*/

Pool.prototype.process = function(){
  if (this.tasks.length && this.workers.length){
    var task = this.tasks.shift(),
      worker = this.workers.shift(),
      self = this;

    if (!this.tasks.length) this.empty();

    var removeAllListeners = function(){
      worker.removeAllListeners('error')
        .removeAllListeners('message');
    };

    worker
      .on('error', function(err){
        task.callback(err);
        removeAllListeners();
      })
      .on('message', function(){
        task.callback.apply(task, arguments);
        self.workers.push(worker);

        if (!self.tasks.length && self.workers.length == self.concurrency) self.drain();

        removeAllListeners();
        self.process();
      })
      .send(task.data);
  }
};

/**
* Adds a task to last of queue.
*
* @method push
* @param {Array|Object} tasks
* @param {Function} [callback]
*/

Pool.prototype.push = function(tasks, callback){
  this._insert(tasks, false, callback);
};

/**
* Adds a task to first of queue.
*
* @method unshift
* @param {Array|Object} tasks
* @param {Function} [callback]
*/

Pool.prototype.unshift = function(tasks, callback){
  this._insert(tasks, true, callback);
};

/**
* Terminates all workers.
*
* @method end
*/

Pool.prototype.end = function(){
  this.workers.forEach(function(worker){
    worker.kill();
  });
};

/**
* Returns the number of pending tasks.
*
* @method length
* @return {Number}
*/

Pool.prototype.length = function(){
  return this.tasks.length;
};