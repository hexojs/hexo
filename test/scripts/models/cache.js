var should = require('chai').should();

describe('Cache', function(){
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo();
  var Cache = hexo.model('Cache');

  it('default values', function(){
    var now = Date.now();

    return Cache.insert({
      _id: 'foo'
    }).then(function(data){
      data.mtime.should.gte(now);
      return Cache.removeById(data._id);
    });
  });

  it('_id - required', function(){
    return Cache.insert({}).catch(function(err){
      err.should.have.property('message', 'ID is not defined');
    });
  });
});