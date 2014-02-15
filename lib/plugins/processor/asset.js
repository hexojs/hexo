module.exports = function(data, callback){
  var Asset = hexo.model('Asset'),
    source = data.source.substring(hexo.base_dir.length),
    doc = Asset.findOne({source: source});

  if (data.type === 'delete'){
    if (doc){
      hexo.route.remove(data.path);
      doc.remove();
    }

    return callback();
  }

  Asset.updateStat(source, function(err, asset){
    if (err) return callback(err);

    asset.path = data.path;
    asset.save();

    callback();
  });
};