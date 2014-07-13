module.exports = function(data, callback){
  var Asset = hexo.model('Asset'),
    source = data.source.substring(hexo.base_dir.length),
    doc = Asset.get(source);

  if (data.type === 'delete'){
    if (doc){
      hexo.route.remove(data.path);
      doc.remove();
    }

    return callback();
  }

  if (doc){
    doc.path = data.path;
    doc.modified = data.type === 'update';

    doc.save(function(){
      callback();
    });
  } else {
    Asset.insert({
      _id: source,
      path: data.path,
      modified: true
    }, function(){
      callback();
    });
  }
};