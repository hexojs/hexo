var should = require('chai').should();
var moment = require('moment');

describe('SchemaTypeMoment', function(){
  var SchemaTypeMoment = require('../../../lib/models/types/moment');
  var type = new SchemaTypeMoment('test');

  it('cast()', function(){
    type.cast(1e8).should.eql(moment(1e8));
    type.cast(new Date(2014, 1, 1)).should.eql(moment(new Date(2014, 1, 1)));
    type.cast('2014-11-03T07:45:41.237Z').should.eql(moment('2014-11-03T07:45:41.237Z'));
    type.cast(moment(1e8)).should.eql(moment(1e8));
  });

  it('cast() - default', function(){
    var type = new SchemaTypeMoment('test', {default: moment});
    moment.isMoment(type.cast()).should.be.true;
  });

  function shouldThrowError(value){
    type.validate(value).should.have.property('message', '`' + value + '` is not a valid date!');
  }

  it('validate()', function(){
    type.validate(moment(1e8)).valueOf().should.eql(1e8);
    // shouldThrowError('foo');
    // shouldThrowError([]);
    // shouldThrowError(true);
    // shouldThrowError({});
    shouldThrowError(moment.invalid());
  });

  it('validate() - required', function(){
    var type = new SchemaTypeMoment('test', {required: true});
    type.validate().should.have.property('message', '`test` is required!');
  });

  it('match()', function(){
    type.match(moment(1e8), moment(1e8)).should.be.true;
    type.match(moment(1e8), moment(1e8 + 1)).should.be.false;
    type.match(undefined, moment()).should.be.false;
  });

  it('compare()', function(){
    type.compare(moment([2014, 1, 3]), moment([2014, 1, 2])).should.gt(0);
    type.compare(moment([2014, 1, 1]), moment([2014, 1, 2])).should.lt(0);
    type.compare(moment([2014, 1, 2]), moment([2014, 1, 2])).should.eql(0);
    type.compare(moment()).should.eql(1);
    type.compare(undefined, moment()).should.eql(-1);
    type.compare().should.eql(0);
  });

  it('parse()', function(){
    type.parse('2014-11-03T07:45:41.237Z').should.eql(moment('2014-11-03T07:45:41.237Z'));
    should.not.exist(type.parse());
  });

  it('value()', function(){
    type.value(moment('2014-11-03T07:45:41.237Z')).should.eql('2014-11-03T07:45:41.237Z');
    should.not.exist(type.value());
  });

  it('q$day()', function(){
    type.q$day(moment([2014, 1, 1]), 1).should.be.true;
    type.q$day(moment([2014, 1, 1]), 5).should.be.false;
    type.q$day(undefined, 1).should.be.false;
  });

  it('q$month()', function(){
    type.q$month(moment([2014, 1, 1]), 1).should.be.true;
    type.q$month(moment([2014, 1, 1]), 5).should.be.false;
    type.q$month(undefined, 1).should.be.false;
  });

  it('q$year()', function(){
    type.q$year(moment([2014, 1, 1]), 2014).should.be.true;
    type.q$year(moment([2014, 1, 1]), 1999).should.be.false;
    type.q$year(undefined, 1).should.be.false;
  });

  it('u$inc()', function(){
    type.u$inc(moment(1e8), 1).valueOf().should.eql(1e8 + 1);
    should.not.exist(undefined, 1);
  });

  it('u$dec()', function(){
    type.u$dec(moment(1e8), 1).valueOf().should.eql(1e8 - 1);
    should.not.exist(undefined, 1);
  });
});