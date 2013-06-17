module.exports = function(err, msg){
  var stack = err.stack;

  err.name = 'Error';
  err.message = msg;
  err.stack = stack;

  return err;
};