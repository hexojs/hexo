'use strict';

const moment = require('moment');

describe('common', () => {
  const common = require('../../../dist/plugins/processor/common');

  it('isTmpFile()', () => {
    common.isTmpFile('foo').should.be.false;
    common.isTmpFile('foo%').should.be.true;
    common.isTmpFile('foo~').should.be.true;
  });

  it('isHiddenFile()', () => {
    common.isHiddenFile('foo').should.be.false;
    common.isHiddenFile('_foo').should.be.true;
    common.isHiddenFile('foo/_bar').should.be.true;
    common.isHiddenFile('.foo').should.be.true;
    common.isHiddenFile('foo/.bar').should.be.true;
  });

  it('ignoreTmpAndHiddenFile()', () => {
    const pattern = common.ignoreTmpAndHiddenFile;

    pattern.match('foo').should.be.true;
    pattern.match('foo%').should.be.false;
    pattern.match('foo~').should.be.false;
    pattern.match('_foo').should.be.false;
    pattern.match('foo/_bar').should.be.false;
    pattern.match('.foo').should.be.false;
    pattern.match('foo/.bar').should.be.false;
  });

  it('toDate()', () => {
    const m = moment();
    const d = new Date();

    should.not.exist(common.toDate());
    common.toDate(m).should.eql(m);
    common.toDate(d).should.eql(d);
    common.toDate(1e8).should.eql(new Date(1e8));
    common.toDate('2014-04-25T01:32:21.196Z').should.eql(new Date('2014-04-25T01:32:21.196Z'));
    common.toDate('Apr 24 2014').should.eql(new Date(2014, 3, 24));
    should.not.exist(common.toDate('foo'));
  });

  it('timezone() - date', () => {
    const d = new Date(Date.UTC(1972, 2, 29, 0, 0, 0));
    const d_timezone_UTC = common.timezone(d, 'UTC');
    (common.timezone(d, 'Asia/Shanghai') - d_timezone_UTC).should.eql(-8 * 3600 * 1000);
    (common.timezone(d, 'Asia/Bangkok') - d_timezone_UTC).should.eql(-7 * 3600 * 1000);
    (common.timezone(d, 'America/Los_Angeles') - d_timezone_UTC).should.eql(8 * 3600 * 1000);
  });

  it('timezone() - moment', () => {
    const d = moment(new Date(Date.UTC(1972, 2, 29, 0, 0, 0)));
    const d_timezone_UTC = common.timezone(d, 'UTC');
    (common.timezone(d, 'Europe/Moscow') - d_timezone_UTC).should.eql(-3 * 3600 * 1000);
  });

  it('isMatch() - string', () => {
    // String
    common.isMatch('foo/test.html', 'foo/*.html').should.be.true;
    common.isMatch('foo/test.html', 'bar/*.html').should.be.false;

    // Array
    common.isMatch('foo/test.html', []).should.be.false;
    common.isMatch('foo/test.html', ['foo/*.html']).should.be.true;
    common.isMatch('foo/test.html', ['bar/*.html', 'foo/*.html']).should.be.true;
    common.isMatch('foo/test.html', ['bar/*.html', 'baz/*.html']).should.be.false;

    // Undefined
    common.isMatch('foo/test.html').should.be.false;
  });
});
