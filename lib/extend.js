var helper = exports.helper = new function(){
  return {
    register: function(tag, method){
      helper.__defineGetter__(tag, method);
    }
  }
};