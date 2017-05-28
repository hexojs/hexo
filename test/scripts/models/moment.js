var should = require('chai').should(); // eslint-disable-line
var moment = require('moment-timezone');

describe('SchemaTypeMoment', () => {
  var SchemaTypeMoment = require('../../../lib/models/types/moment');
  var type = new SchemaTypeMoment('test');

  it('cast()', () => {
    type.cast(1e8).should.eql(moment(1e8));
    type.cast(new Date(2014, 1, 1)).should.eql(moment(new Date(2014, 1, 1)));
    type.cast('2014-11-03T07:45:41.237Z').should.eql(moment('2014-11-03T07:45:41.237Z'));
    type.cast(moment(1e8)).valueOf().should.eql(1e8);
  });

  it('cast() - default', () => {
    var type = new SchemaTypeMoment('test', {default: moment});
    moment.isMoment(type.cast()).should.be.true;
  });

  it('cast() - language', () => {
    var lang = 'zh-tw';
    var format = 'LLLL';
    var type = new SchemaTypeMoment('test', {language: lang});
    var now = Date.now();

    type.cast(now).format(format).should.eql(moment(now).locale(lang).format(format));
  });

  it('cast() - timezone', () => {
    var timezone = 'Etc/UTC';
    var format = 'LLLL';
    var type = new SchemaTypeMoment('test', {timezone});
    var now = Date.now();

    type.cast(now).format(format).should.eql(moment(now).tz(timezone).format(format));
  });

  function shouldThrowError(value) {
    try {
      type.validate(value);
    } catch (err) {
      err.should.have.property('message', '`' + value + '` is not a valid date!');
    }
  }

  it('validate()', () => {
    type.validate(moment(1e8)).valueOf().should.eql(1e8);
    shouldThrowError(moment.invalid());
  });

  it('validate() - required', () => {
    var type = new SchemaTypeMoment('test', {required: true});

    try {
      type.validate();
    } catch (err) {
      err.should.have.property('message', '`test` is required!');
    }
  });

  it('match()', () => {
    type.match(moment(1e8), moment(1e8)).should.be.true;
    type.match(moment(1e8), moment(1e8 + 1)).should.be.false;
    type.match(undefined, moment()).should.be.false;
  });

  it('compare()', () => {
    type.compare(moment([2014, 1, 3]), moment([2014, 1, 2])).should.gt(0);
    type.compare(moment([2014, 1, 1]), moment([2014, 1, 2])).should.lt(0);
    type.compare(moment([2014, 1, 2]), moment([2014, 1, 2])).should.eql(0);
    type.compare(moment()).should.eql(1);
    type.compare(undefined, moment()).should.eql(-1);
    type.compare().should.eql(0);
  });

  it('parse()', () => {
    type.parse('2014-11-03T07:45:41.237Z').should.eql(moment('2014-11-03T07:45:41.237Z'));
    should.not.exist(type.parse());
  });

  it('value()', () => {
    type.value(moment('2014-11-03T07:45:41.237Z')).should.eql('2014-11-03T07:45:41.237Z');
    should.not.exist(type.value());
  });

  it('q$day()', () => {
    type.q$day(moment([2014, 1, 1]), 1).should.be.true;
    type.q$day(moment([2014, 1, 1]), 5).should.be.false;
    type.q$day(undefined, 1).should.be.false;
  });

  it('q$month()', () => {
    type.q$month(moment([2014, 1, 1]), 1).should.be.true;
    type.q$month(moment([2014, 1, 1]), 5).should.be.false;
    type.q$month(undefined, 1).should.be.false;
  });

  it('q$year()', () => {
    type.q$year(moment([2014, 1, 1]), 2014).should.be.true;
    type.q$year(moment([2014, 1, 1]), 1999).should.be.false;
    type.q$year(undefined, 1).should.be.false;
  });

  it('u$inc()', () => {
    type.u$inc(moment(1e8), 1).valueOf().should.eql(1e8 + 1);
    should.not.exist(undefined, 1);
  });

  it('u$dec()', () => {
    type.u$dec(moment(1e8), 1).valueOf().should.eql(1e8 - 1);
    should.not.exist(undefined, 1);
  });
});
