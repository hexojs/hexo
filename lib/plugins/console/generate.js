module.exports = function(args){
  var watch = args.w || args.watch;

  this.emit('generateBefore');

  return this.post.load({watch: watch}).then(function(){
    //
  });
};