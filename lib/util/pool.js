/**
 * Module dependencies.
 */

var child_process = require('child_process'),
  cpus = require('os').cpus().length;

/**
 * setImmediate fallback.
 */

if (typeof setImmediate === 'undefined'){
  setImmediate = process.nextTick;
}

/**
 * Create a new thread pool.
 *
 * @param {String} worker
 * @param {Number} concurrency
 * @api public
 */

var Pool = module.exports = function Pool(worker, concurrency){
  this.tasks = [];
  this.workers = [];
  this.concurrency = concurrency || cpus;
  this.drain = function(){};
  this.saturated = function(){};
  this.empty = function(){};

  for (var i = 0; i < this.concurrency; i++){
    this.workers.push(child_process.fork(worker));
  }
};

/**
 * Insert task to the queue.
 * `callback` is invoked once `worker` has finished the task.
 *
 * @param {Array|Object} tasks
 * @param {Boolean} pos
 * @param {Function} callback
 * @api private
 */

Pool.prototype._insert = function(tasks, pos, callback){
  if (!Array.isArray(tasks)) tasks = [tasks];

  var self = this;

  tasks.forEach(function(task){
    var item = {
      data: task,
      callback: typeof callback === 'function' ? callback : function(){}
    };

    if (pos){
      self.tasks.unshift(item);
    } else {
      self.tasks.push(item);
    }

    if (self.tasks.length === self.concurrency){
      self.saturated();
    }

    setImmediate(self.process());
  });
};

/**
 * Distribute `tasks` to `worker`.
 *
 * @api private
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
 * Add `tasks` to the queue.
 * `callback` is invoked once `worker` has finished the task.
 *
 * @param {Array|Object} tasks
 * @param {Function} callback
 * @api public
 */

Pool.prototype.push = function(tasks, callback){
  this._insert(tasks, false, callback);
};

/**
 * Add `tasks` to the front of the queue.
 * `callback` is invoked once `worker` has finished the task.
 *
 * @param {Array|Object} tasks
 * @param {Function} callback
 * @api public
 */

Pool.prototype.unshift = function(tasks, callback){
  this._insert(tasks, true, callback);
};

/**
 * Terminate all workers.
 *
 * @api public
 */

Pool.prototype.end = function(){
  this.workers.forEach(function(worker){
    worker.kill();
  });
};

/**
 * Return how many tasks waiting to be processed.
 *
 * @return {Number}
 * @api public
 */

Pool.prototype.length = function(){
  return this.tasks.length;
};