var moment = require('moment');
var should = require('chai').should();

describe('date', function(){
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo();
  var date = require('../../../lib/plugins/helper/date');

  it('date', function(){
    // moment
    var now = moment();
    date.date.call(hexo, now).should.eql(now.format(hexo.config.date_format));
    date.date(now, 'MMM-D-YYYY').should.eql(now.format('MMM-D-YYYY'));

    // date
    now = new Date();
    date.date.call(hexo, now).should.eql(moment(now).format(hexo.config.date_format));
    date.date(now, 'MMM-D-YYYY').should.eql(moment(now).format('MMM-D-YYYY'));

    // number
    now = Date.now();
    date.date.call(hexo, now).should.eql(moment(now).format(hexo.config.date_format));
    date.date(now, 'MMM-D-YYYY').should.eql(moment(now).format('MMM-D-YYYY'));
  });

  it('date_xml', function(){
    // moment
    var now = moment();
    date.date_xml(now).should.eql(now.toISOString());

    // date
    now = new Date();
    date.date_xml(now).should.eql(now.toISOString());

    // number
    now = Date.now();
    date.date_xml(now).should.eql(new Date(now).toISOString());
  });

  it('time', function(){
    // moment
    var now = moment();
    date.time.call(hexo, now).should.eql(now.format(hexo.config.time_format));
    date.time(now, 'H:mm').should.eql(now.format('H:mm'));

    // date
    now = new Date();
    date.time.call(hexo, now).should.eql(moment(now).format(hexo.config.time_format));
    date.time(now, 'H:mm').should.eql(moment(now).format('H:mm'));

    // number
    now = Date.now();
    date.time.call(hexo, now).should.eql(moment(now).format(hexo.config.time_format));
    date.time(now, 'H:mm').should.eql(moment(now).format('H:mm'));
  });

  it('full_date', function(){
    var fullDate = date.full_date.bind({
      config: hexo.config,
      date: date.date,
      time: date.time
    });

    // moment
    var now = moment();
    fullDate(now).should.eql(now.format(hexo.config.date_format + ' ' + hexo.config.time_format));
    fullDate(now, 'MMM-D-YYYY').should.eql(now.format('MMM-D-YYYY'));

    // date
    now = new Date();
    fullDate(now).should.eql(moment(now).format(hexo.config.date_format + ' ' + hexo.config.time_format));
    fullDate(now, 'MMM-D-YYYY').should.eql(moment(now).format('MMM-D-YYYY'));

    // number
    now = Date.now();
    fullDate(now).should.eql(moment(now).format(hexo.config.date_format + ' ' + hexo.config.time_format));
    fullDate(now, 'MMM-D-YYYY').should.eql(moment(now).format('MMM-D-YYYY'));
  });

  it('time_tag', function(){
    var timeTag = date.time_tag.bind({
      config: hexo.config,
      date: date.date
    });

    // moment
    var now = moment();
    timeTag(now).should.eql('<time datetime="' + now.toISOString() + '">' + now.format(hexo.config.date_format) + '</time>');
    timeTag(now, 'MMM-D-YYYY').should.eql('<time datetime="' + now.toISOString() + '">' + now.format('MMM-D-YYYY') + '</time>');

    // date
    now = new Date();
    timeTag(now).should.eql('<time datetime="' + moment(now).toISOString() + '">' + moment(now).format(hexo.config.date_format) + '</time>');
    timeTag(now, 'MMM-D-YYYY').should.eql('<time datetime="' + moment(now).toISOString() + '">' + moment(now).format('MMM-D-YYYY') + '</time>');

    // number
    now = Date.now();
    timeTag(now).should.eql('<time datetime="' + moment(now).toISOString() + '">' + moment(now).format(hexo.config.date_format) + '</time>');
    timeTag(now, 'MMM-D-YYYY').should.eql('<time datetime="' + moment(now).toISOString() + '">' + moment(now).format('MMM-D-YYYY') + '</time>');
  });
});