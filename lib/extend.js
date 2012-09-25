var render = exports.render = new function(){
  return {
    register: function(tag, method){
      render.__defineGetter__(tag, method);
    }
  }
};