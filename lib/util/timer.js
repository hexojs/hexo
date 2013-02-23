var Timer = module.exports = function(fn, delay){
  var remaining = delay,
    timer,
    start;

  this.pause = function(){
    clearTimeout(timer);
    remaining -= new Date() - start;
    return this;
  };

  this.resume = function(){
    start = new Date();
    timer = setTimeout(fn, remaining);
    return this;
  };

  this.restart = function(){
    remaining = delay;
    this.resume();
    return this;
  };

  this.resume();
};