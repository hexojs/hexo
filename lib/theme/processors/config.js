var Pattern = require('../../box/pattern');

exports.process = function(file){
  if (file.type === 'delete'){
    file.box.config = {};
    return;
  }

  var self = this;

  return file.render().then(function(result){
    file.box.config = result;
    self.log.debug('Theme config loaded.');
  }, function(err){
    self.log.error('Theme config load failed.');
    throw err;
  });
};

exports.pattern = new Pattern(/^_config\.\w+$/);