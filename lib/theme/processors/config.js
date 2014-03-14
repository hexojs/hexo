var HexoError = require('../../error'),
  Pattern = require('../../box/pattern');

exports.process = function(data, callback){
  if (data.type === 'delete'){
    data.box.config = {};
    return callback();
  }

  data.render(function(err, result){
    if (err) return callback(HexoError.wrap(err, 'Theme config load failed'));

    data.box.config = result;

    hexo.log.d('Theme config loaded');
    callback();
  });
};

exports.pattern = new Pattern(/^_config\.(yml|yaml)$/);