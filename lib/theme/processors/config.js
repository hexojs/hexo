var Pattern = require('../../box/pattern');

exports.process = function(data){
  if (data.type === 'delete'){
    this.config = {};
    return;
  }

  var ctx = this.context;

  return data.render().then(function(result){
    data.box.config = result;
    ctx.log.debug('Theme config loaded.');
  }, function(err){
    ctx.log.error('Theme config load failed.');
    throw err;
  });
};

exports.pattern = new Pattern(/^_config\.\w+$/);