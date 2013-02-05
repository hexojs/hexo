var Timer = module.exports = function(fn, delay){
  var remaining = delay,
    timer,
    start;

  this.pause = function(){
    clearTimeout(timer);
    remaining -= new Date() - start;
  };

  this.resume = function(){
    start = new Date();
    timer = setTimeout(fn, remaining);
  };

  this.restart = function(){
    remaining = delay;
    this.resume();
  };

  this.resume();
};