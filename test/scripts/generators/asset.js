var should = require('chai').should();
var Promise = require('bluebird');
var pathFn = require('path');
var fs = require('hexo-fs');
var testUtil = require('../../util');

describe('asset', function(){
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo(pathFn.join(__dirname, 'asset_test'), {silent: true});
  var generator = require('../../../lib/plugins/generator/asset').bind(hexo);
  var Asset = hexo.model('Asset');

  function checkStream(stream, expected){
    return testUtil.stream.read(stream).then(function(data){
      data.should.eql(expected);
    });
  }

  before(function(){
    return fs.mkdirs(hexo.base_dir);
  });

  after(function(){
    return fs.rmdir(hexo.base_dir);
  });

  it('Asset', function(){
    var path = 'test.txt';
    var source = pathFn.join(hexo.base_dir, path);
    var content = 'test content';

    return Promise.all([
      Asset.insert({_id: path, path: path}),
      fs.writeFile(source, content)
    ]).then(function(){
      return generator(hexo.locals);
    }).then(function(data){
      data[0].path.should.eql(path);
      data[0].data.modified.should.be.true;

      return checkStream(data[0].data(), content);
    }).then(function(){
      return Promise.all([
        Asset.removeById(path),
        fs.unlink(source)
      ]);
    })
  });

  it('PostAsset');

  it('remove assets which does not exist', function(){
    var path = 'test.txt';

    return Asset.insert({
      _id: path,
      path: path
    }).then(function(){
      return generator(hexo.locals);
    }).then(function(){
      should.not.exist(Asset.findById(path));
    });
  });
});