module.exports = function(err, msg){
  var stack = err.stack;

  err.name = 'HexoError';
  err.message = msg;
  err.stack = stack;

  return err;
};