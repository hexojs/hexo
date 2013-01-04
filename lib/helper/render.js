var extend = require('../extend'),
  render = require('./render').renderSync;

extend.helper.register('render', function(){
  return function(str, ext, locals){
    return renderSync(str, ext, locals);
  }
});