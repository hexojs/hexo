'use strict';

var should = require('chai').should();
var moment = require('moment');

describe('common', function(){
  var common = require('../../../lib/plugins/processor/common');

  it('isTmpFile()', function(){
    common.isTmpFile('foo').should.be.false;
    common.isTmpFile('foo%').should.be.true;
    common.isTmpFile('foo~').should.be.true;
  });

  it('isHiddenFile()', function(){
    common.isHiddenFile('foo').should.be.false;
    common.isHiddenFile('_foo').should.be.true;
    common.isHiddenFile('foo/_bar').should.be.true;
  });

  it('ignoreTmpAndHiddenFile()', function(){
    var pattern = common.ignoreTmpAndHiddenFile;

    pattern.match('foo').should.be.true;
    pattern.match('foo%').should.be.false;
    pattern.match('foo~').should.be.false;
    pattern.match('_foo').should.be.false;
    pattern.match('foo/_bar').should.be.false;
  });

  it('toDate()', function(){
    var m = moment();
    var d = new Date();

    should.not.exist(common.toDate());
    common.toDate(m).should.eql(m);
    common.toDate(d).should.eql(d);
    common.toDate(1e8).should.eql(new Date(1e8));
    common.toDate('2014-04-25T01:32:21.196Z').should.eql(new Date('2014-04-25T01:32:21.196Z'));
    common.toDate('Apr 24 2014').should.eql(new Date(2014, 3, 24));
    should.not.exist(common.toDate('foo'));
  });
});