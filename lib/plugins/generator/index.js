module.exports = function(ctx){
  var generator = ctx.extend.generator;

  function register(name){
    generator.register(name, require('./' + name));
  }

  register('archive');
  register('asset');
  register('category');
  register('home');
  register('page');
  register('post');
  register('tag');
};