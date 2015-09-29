'use strict';

var should = require('chai').should(); // eslint-disable-line
var sinon = require('sinon');

describe('Cache', function() {
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo();
  var Cache = hexo.model('Cache');

  it('_id - required', function() {
    var errorCallback = sinon.spy(function(err) {
      err.should.have.property('message', 'ID is not defined');
    });

    return Cache.insert({}).catch(errorCallback).finally(function() {
      errorCallback.calledOnce.should.be.true;
    });
  });
});
