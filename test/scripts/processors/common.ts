import moment from 'moment';
import { isTmpFile, isHiddenFile, toDate, adjustDateForTimezone, isMatch } from '../../../lib/plugins/processor/common';
import chai from 'chai';
const should = chai.should();
const DURATION_MINUTE = 1000 * 60;

describe('common', () => {
  it('isTmpFile()', () => {
    isTmpFile('foo').should.be.false;
    isTmpFile('foo%').should.be.true;
    isTmpFile('foo~').should.be.true;
  });

  it('isHiddenFile()', () => {
    isHiddenFile('foo').should.be.false;
    isHiddenFile('_foo').should.be.true;
    isHiddenFile('foo/_bar').should.be.true;
    isHiddenFile('.foo').should.be.true;
    isHiddenFile('foo/.bar').should.be.true;
  });

  it('toDate()', () => {
    const m = moment();
    const d = new Date();
    const diff = d.getTimezoneOffset() * DURATION_MINUTE;

    should.not.exist(toDate());
    toDate(m)!.should.eql(m);
    toDate(d)!.should.eql(d);
    toDate(1e8)!.should.eql(new Date(1e8 - diff));
    toDate('Apr 24 2014')!.should.eql(new Date(new Date(2014, 3, 24).getTime() - diff));
    should.not.exist(toDate('foo'));
  });

  it('timezone() - date', () => {
    const d = new Date(Date.UTC(1972, 2, 29, 0, 0, 0));
    const d_timezone_UTC = adjustDateForTimezone(d, 'UTC').getTime();
    (adjustDateForTimezone(d, 'Asia/Shanghai').getTime() - d_timezone_UTC).should.eql(-8 * 3600 * 1000);
    (adjustDateForTimezone(d, 'Asia/Bangkok').getTime() - d_timezone_UTC).should.eql(-7 * 3600 * 1000);
    (adjustDateForTimezone(d, 'America/Los_Angeles').getTime() - d_timezone_UTC).should.eql(8 * 3600 * 1000);
  });

  it('timezone() - moment', () => {
    const d = moment(new Date(Date.UTC(1972, 2, 29, 0, 0, 0)));
    const d_timezone_UTC = adjustDateForTimezone(d, 'UTC').getTime();
    (adjustDateForTimezone(d, 'Europe/Moscow').getTime() - d_timezone_UTC).should.eql(-3 * 3600 * 1000);
  });

  it('isMatch() - string', () => {
    // String
    isMatch('foo/test.html', 'foo/*.html').should.be.true;
    isMatch('foo/test.html', 'bar/*.html').should.be.false;

    // Array
    isMatch('foo/test.html', []).should.be.false;
    isMatch('foo/test.html', ['foo/*.html']).should.be.true;
    isMatch('foo/test.html', ['bar/*.html', 'foo/*.html']).should.be.true;
    isMatch('foo/test.html', ['bar/*.html', 'baz/*.html']).should.be.false;

    // Undefined
    isMatch('foo/test.html').should.be.false;
  });
});
