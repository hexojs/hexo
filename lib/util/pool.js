var child_process = require('child_process'),
  cpus = require('os').cpus().length;

if (typeof setImmediate === 'undefined'){
  setImmediate = process.nextTick;
}

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

Pool.prototype.push = function(tasks, callback){
  this._insert(tasks, false, callback);
};

Pool.prototype.unshift = function(tasks, callback){
  this._insert(tasks, true, callback);
};

Pool.prototype.end = function(){
  this.workers.forEach(function(worker){
    worker.kill();
  });
};

Pool.prototype.length = function(){
  return this.tasks.length;
};