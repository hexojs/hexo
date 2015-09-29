'use strict';

var should = require('chai').should(); // eslint-disable-line
var sinon = require('sinon');
var pathFn = require('path');

describe('Asset', function() {
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo();
  var Asset = hexo.model('Asset');

  it('default values', function() {
    return Asset.insert({
      _id: 'foo',
      path: 'bar'
    }).then(function(data) {
      data.modified.should.be.true;
      return Asset.removeById(data._id);
    });
  });

  it('_id - required', function() {
    var errorCallback = sinon.spy(function(err) {
      err.should.have.property('message', 'ID is not defined');
    });

    return Asset.insert({}).catch(errorCallback).finally(function() {
      errorCallback.calledOnce.should.be.true;
    });
  });

  it('path - required', function() {
    var errorCallback = sinon.spy(function(err) {
      err.should.have.property('message', '`path` is required!');
    });

    return Asset.insert({
      _id: 'foo'
    }).catch(errorCallback).finally(function() {
      errorCallback.calledOnce.should.be.true;
    });
  });

  it('source - virtual', function() {
    return Asset.insert({
      _id: 'foo',
      path: 'bar'
    }).then(function(data) {
      data.source.should.eql(pathFn.join(hexo.base_dir, data._id));
      return Asset.removeById(data._id);
    });
  });
});
