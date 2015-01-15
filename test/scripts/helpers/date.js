var moment = require('moment');
var should = require('chai').should();

describe('date', function(){
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo();
  var dateHelper = require('../../../lib/plugins/helper/date');

  it('date', function(){
    var ctx = {
      config: hexo.config,
      page: {}
    };

    var date = dateHelper.date.bind(ctx);

    // moment
    var now = moment();
    date(now).should.eql(now.format(hexo.config.date_format));
    date(now, 'MMM-D-YYYY').should.eql(now.format('MMM-D-YYYY'));

    // date
    now = new Date();
    date(now).should.eql(moment(now).format(hexo.config.date_format));
    date(now, 'MMM-D-YYYY').should.eql(moment(now).format('MMM-D-YYYY'));

    // number
    now = Date.now();
    date(now).should.eql(moment(now).format(hexo.config.date_format));
    date(now, 'MMM-D-YYYY').should.eql(moment(now).format('MMM-D-YYYY'));

    // page.lang
    ctx.page.lang = 'zh-tw';
    date(now).should.eql(moment(now).locale('zh-tw').format(hexo.config.date_format));
    ctx.page.lang = '';

    // config.language
    ctx.config.language = 'ja';
    date(now).should.eql(moment(now).locale('ja').format(hexo.config.date_format));
    ctx.config.language = '';
  });

  it('date_xml', function(){
    var dateXML = dateHelper.date_xml;

    // moment
    var now = moment();
    dateXML(now).should.eql(now.toISOString());

    // date
    now = new Date();
    dateXML(now).should.eql(now.toISOString());

    // number
    now = Date.now();
    dateXML(now).should.eql(new Date(now).toISOString());
  });

  it('time', function(){
    var ctx = {
      config: hexo.config,
      page: {}
    };

    var time = dateHelper.time.bind(ctx);

    // moment
    var now = moment();
    time(now).should.eql(now.format(hexo.config.time_format));
    time(now, 'H:mm').should.eql(now.format('H:mm'));

    // date
    now = new Date();
    time(now).should.eql(moment(now).format(hexo.config.time_format));
    time(now, 'H:mm').should.eql(moment(now).format('H:mm'));

    // number
    now = Date.now();
    time(now).should.eql(moment(now).format(hexo.config.time_format));
    time(now, 'H:mm').should.eql(moment(now).format('H:mm'));

    // page.lang
    ctx.page.lang = 'zh-tw';
    time(now).should.eql(moment(now).locale('zh-tw').format(hexo.config.time_format));
    ctx.page.lang = '';

    // config.language
    ctx.config.language = 'ja';
    time(now).should.eql(moment(now).locale('ja').format(hexo.config.time_format));
    ctx.config.language = '';
  });

  it('full_date', function(){
    var ctx = {
      config: hexo.config,
      date: dateHelper.date,
      time: dateHelper.time,
      page: {}
    };

    var fullDate = dateHelper.full_date.bind(ctx);
    var fullDateFormat = hexo.config.date_format + ' ' + hexo.config.time_format;

    // moment
    var now = moment();
    fullDate(now).should.eql(now.format(fullDateFormat));
    fullDate(now, 'MMM-D-YYYY').should.eql(now.format('MMM-D-YYYY'));

    // date
    now = new Date();
    fullDate(now).should.eql(moment(now).format(fullDateFormat));
    fullDate(now, 'MMM-D-YYYY').should.eql(moment(now).format('MMM-D-YYYY'));

    // number
    now = Date.now();
    fullDate(now).should.eql(moment(now).format(fullDateFormat));
    fullDate(now, 'MMM-D-YYYY').should.eql(moment(now).format('MMM-D-YYYY'));

    // page.lang
    ctx.page.lang = 'zh-tw';
    fullDate(now).should.eql(moment(now).locale('zh-tw').format(fullDateFormat));
    ctx.page.lang = '';

    // config.language
    ctx.config.language = 'ja';
    fullDate(now).should.eql(moment(now).locale('ja').format(fullDateFormat));
    ctx.config.language = '';
  });

  it('time_tag', function(){
    var ctx = {
      config: hexo.config,
      date: dateHelper.date,
      page: {}
    };

    var timeTag = dateHelper.time_tag.bind(ctx);

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

    // page.lang
    ctx.page.lang = 'zh-tw';
    timeTag(now).should.eql('<time datetime="' + moment(now).toISOString() + '">' + moment(now).locale('zh-tw').format(hexo.config.date_format) + '</time>');
    ctx.page.lang = '';

    // config.language
    ctx.config.language = 'ja';
    timeTag(now).should.eql('<time datetime="' + moment(now).toISOString() + '">' + moment(now).locale('ja').format(hexo.config.date_format) + '</time>');
    ctx.config.language = '';
  });
});