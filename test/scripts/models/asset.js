var should = require('chai').should();
var pathFn = require('path');

describe('Asset', function(){
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo();
  var Asset = hexo.model('Asset');

  it('default values', function(){
    return Asset.insert({
      _id: 'foo',
      path: 'bar'
    }).then(function(data){
      data.modified.should.be.true;
      return Asset.removeById(data._id);
    });
  });

  it('_id - required', function(){
    return Asset.insert({}).catch(function(err){
      err.should.have.property('message', 'ID is not defined');
    });
  });

  it('path - required', function(){
    return Asset.insert({
      _id: 'foo'
    }).catch(function(err){
      err.should.have.property('message', '`path` is required!');
    });
  });

  it('source - virtual', function(){
    return Asset.insert({
      _id: 'foo',
      path: 'bar'
    }).then(function(data){
      data.source.should.eql(pathFn.join(hexo.base_dir, data._id));
      return Asset.removeById(data._id);
    });
  });
});