var moment = require('moment'),
  should = require('chai').should();

describe('Helper - date', function(){
  var date = require('../../../lib/plugins/helper/date'),
    config = hexo.config;

  var genTimeTag = function(date, format){
    if (!(date instanceof Date)){
      if (moment.isMoment(date)){
        date = date.toDate();
      } else {
        date = new Date(date);
      }
    }

    return '<time datetime="' + date.toISOString() + '">' + moment(date).format(format) + '</time>';
  };

  it('date', function(){
    var format = config.date_format,
      custom = 'YYYY-MM-DD';

    moment(date.date(), format).isValid().should.be.true;

    var nowDate = new Date();
    date.date(nowDate).should.eql(moment(nowDate).format(format));
    date.date(nowDate, custom).should.eql(moment(nowDate).format(custom));

    var nowMoment = moment();
    date.date(nowMoment).should.eql(nowMoment.format(format));
    date.date(nowMoment, custom).should.eql(nowMoment.format(custom));

    var nowMs = Date.now();
    date.date(nowMs).should.eql(moment(nowMs).format(format));
    date.date(nowMs, custom).should.eql(moment(nowMs).format(custom));
  });

  it('date_xml', function(){
    date.date_xml().should.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);

    var nowDate = new Date();
    date.date_xml(nowDate).should.eql(nowDate.toISOString());

    var nowMoment = moment();
    date.date_xml(nowMoment).should.eql(nowMoment.toDate().toISOString());

    var nowMs = Date.now();
    date.date_xml(nowMs).should.eql(new Date(nowMs).toISOString());
  });

  it('time', function(){
    var format = config.time_format,
      custom = 'H:mm';

    moment(date.time(), format).isValid().should.be.true;

    var nowDate = new Date();
    date.time(nowDate).should.eql(moment(nowDate).format(format));
    date.time(nowDate, custom).should.eql(moment(nowDate).format(custom));

    var nowMoment = moment();
    date.time(nowMoment).should.eql(nowMoment.format(format));
    date.time(nowMoment, custom).should.eql(nowMoment.format(custom));

    var nowMs = Date.now();
    date.time(nowMs).should.eql(moment(nowMs).format(format));
    date.time(nowMs, custom).should.eql(moment(nowMs).format(custom));

  });

  it('full_date', function(){
    var format = config.date_format + ' ' + config.time_format,
      custom = 'YYYY-MM-DD H:mm';

    moment(date.full_date(), format).isValid().should.be.true;

    var nowDate = new Date();
    date.full_date(nowDate).should.eql(moment(nowDate).format(format));
    date.full_date(nowDate, custom).should.eql(moment(nowDate).format(custom));

    var nowMoment = moment();
    date.full_date(nowMoment).should.eql(nowMoment.format(format));
    date.full_date(nowMoment, custom).should.eql(nowMoment.format(custom));

    var nowMs = Date.now();
    date.full_date(nowMs).should.eql(moment(nowMs).format(format));
    date.full_date(nowMs, custom).should.eql(moment(nowMs).format(custom));
  });

  it('time_tag', function(){
    var format = config.date_format,
      custom = 'YYYY-MM-DD';

    var nowDate = new Date();
    date.time_tag(nowDate).should.eql(genTimeTag(nowDate, format));
    date.time_tag(nowDate, custom).should.eql(genTimeTag(nowDate, custom));

    var nowMoment = moment();
    date.time_tag(nowMoment).should.eql(genTimeTag(nowMoment, format));
    date.time_tag(nowMoment, custom).should.eql(genTimeTag(nowMoment, custom));

    var nowMs = Date.now();
    date.time_tag(nowMs).should.eql(genTimeTag(nowMs, format));
    date.time_tag(nowMs, custom).should.eql(genTimeTag(nowMs, custom));
  });

  it('moment', function(){
    moment.isMoment(new date.moment()).should.be.true;
  });
});