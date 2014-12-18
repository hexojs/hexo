var should = require('chai').should();
var Promise = require('bluebird');
var pathFn = require('path');
var fs = require('hexo-fs');

describe('asset', function(){
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo(pathFn.join(__dirname, 'asset_test'), {silent: true});
  var generator = require('../../../lib/plugins/generator/asset').bind(hexo);
  var Asset = hexo.model('Asset');

  before(function(){
    return fs.mkdirs(hexo.base_dir);
  });

  after(function(){
    return fs.rmdir(hexo.base_dir);
  });

  it('Asset', function(){
    var path = 'test.txt';
    var source = pathFn.join(hexo.base_dir, path);

    return Promise.all([
      Asset.insert({_id: path, path: path}),
      fs.writeFile(source, '')
    ]).then(function(){
      return generator(hexo.locals);
    }).then(function(){
      var route = hexo.route.get(path);

      route.modified = true;

      route(function(err, result){
        result.path.should.eql(source);
      });

      hexo.route.remove(path);

      return Promise.all([
        Asset.removeById(path),
        fs.unlink(source)
      ]);
    });
  });

  it.skip('PostAsset');

  it('remove assets which does not exist', function(){
    var path = 'test.txt';

    return Asset.insert({
      _id: path,
      path: path
    }).then(function(){
      return generator(hexo.locals);
    }).then(function(){
      should.not.exist(hexo.route.get(path));
      should.not.exist(Asset.findById(path));
    });
  });
});