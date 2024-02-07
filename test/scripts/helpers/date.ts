import moment from 'moment-timezone';
import { useFakeTimers } from 'sinon';
import Hexo from '../../../lib/hexo';
import { date as dateHelper, date_xml, relative_date, time as timeHelper, full_date, time_tag, toMomentLocale } from '../../../lib/plugins/helper/date';
type DateHelperParams = Parameters<typeof dateHelper>;
type DateHelperReturn = ReturnType<typeof dateHelper>;
type TimeHelperParams = Parameters<typeof timeHelper>;
type TimeHelperReturn = ReturnType<typeof timeHelper>;
type FullDateHelperParams = Parameters<typeof full_date>;
type FullDateHelperReturn = ReturnType<typeof full_date>;
type TimeTagHelperParams = Parameters<typeof time_tag>;
type TimeTagHelperReturn = ReturnType<typeof time_tag>;
type RelativeDateHelperParams = Parameters<typeof relative_date>;
type RelativeDateHelperReturn = ReturnType<typeof relative_date>;

describe('date', () => {
  const hexo = new Hexo();
  let clock;

  before(() => {
    clock = useFakeTimers(Date.now());
  });

  after(() => {
    clock.restore();
  });

  it('date', () => {
    const ctx: any = {
      config: hexo.config,
      page: {}
    };

    const date: (...args: DateHelperParams) => DateHelperReturn = dateHelper.bind(ctx);

    // now
    date().should.eql(moment().format(hexo.config.date_format));

    // moment
    date(moment()).should.eql(moment().format(hexo.config.date_format));
    date(moment(), 'MMM-D-YYYY').should.eql(moment().format('MMM-D-YYYY'));

    // date
    date(new Date()).should.eql(moment().format(hexo.config.date_format));
    date(new Date(), 'MMM-D-YYYY').should.eql(moment().format('MMM-D-YYYY'));

    // number
    date(Date.now()).should.eql(moment().format(hexo.config.date_format));
    date(Date.now(), 'MMM-D-YYYY').should.eql(moment().format('MMM-D-YYYY'));

    // page.lang
    ctx.page.lang = 'zh-tw';
    date(Date.now(), 'MMM D YYYY').should.eql(moment().locale('zh-tw').format('MMM D YYYY'));
    ctx.page.lang = '';

    // config.language
    ctx.config.language = 'ja';
    date(Date.now(), 'MMM D YYYY').should.eql(moment().locale('ja').format('MMM D YYYY'));
    ctx.config.language = '';

    // timezone
    ctx.config.timezone = 'UTC';
    date(Date.now(), 'LLL').should.eql(moment().tz('UTC').format('LLL'));
    ctx.config.timezone = '';
  });

  it('date_xml', () => {
    const dateXML = date_xml;

    // now
    dateXML().should.eql(moment().toISOString());

    // moment
    dateXML(moment()).should.eql(moment().toISOString());

    // date
    dateXML(new Date()).should.eql(moment().toISOString());

    // number
    dateXML(Date.now()).should.eql(moment().toISOString());
  });

  it('relative_date', () => {
    const ctx = {
      config: hexo.config,
      page: {}
    };

    const relativeDate: (...args: RelativeDateHelperParams) => RelativeDateHelperReturn = relative_date.bind(ctx);

    // now
    relativeDate().should.eql(moment().fromNow());

    // moment
    relativeDate(moment()).should.eql(moment().fromNow());

    // date
    relativeDate(new Date()).should.eql(moment().fromNow());

    // number
    relativeDate(Date.now()).should.eql(moment().fromNow());
  });

  it('time', () => {
    const ctx: any = {
      config: hexo.config,
      page: {}
    };

    const time: (...args: TimeHelperParams) => TimeHelperReturn = timeHelper.bind(ctx);

    // now
    time().should.eql(moment().format(hexo.config.time_format));

    // moment
    time(moment()).should.eql(moment().format(hexo.config.time_format));
    time(moment(), 'H:mm').should.eql(moment().format('H:mm'));

    // date
    time(new Date()).should.eql(moment().format(hexo.config.time_format));
    time(new Date(), 'H:mm').should.eql(moment().format('H:mm'));

    // number
    time(Date.now()).should.eql(moment().format(hexo.config.time_format));
    time(Date.now(), 'H:mm').should.eql(moment().format('H:mm'));

    // page.lang
    ctx.page.lang = 'zh-tw';
    time(Date.now(), 'A H:mm').should.eql(moment().locale('zh-tw').format('A H:mm'));
    ctx.page.lang = '';

    // config.language
    ctx.config.language = 'ja';
    time(Date.now(), 'A H:mm').should.eql(moment().locale('ja').format('A H:mm'));
    ctx.config.language = '';

    // timezone
    ctx.config.timezone = 'UTC';
    time().should.eql(moment().tz('UTC').format(hexo.config.time_format));
    ctx.config.timezone = '';
  });

  it('full_date', () => {
    const ctx: any = {
      config: hexo.config,
      date: dateHelper,
      time: timeHelper,
      page: {}
    };

    const fullDate: (...args: FullDateHelperParams) => FullDateHelperReturn = full_date.bind(ctx);
    const fullDateFormat = hexo.config.date_format + ' ' + hexo.config.time_format;

    // now
    fullDate().should.eql(moment().format(fullDateFormat));

    // moment
    fullDate(moment()).should.eql(moment().format(fullDateFormat));
    fullDate(moment(), 'MMM-D-YYYY').should.eql(moment().format('MMM-D-YYYY'));

    // date
    fullDate(new Date()).should.eql(moment().format(fullDateFormat));
    fullDate(new Date(), 'MMM-D-YYYY').should.eql(moment().format('MMM-D-YYYY'));

    // number
    fullDate(Date.now()).should.eql(moment().format(fullDateFormat));
    fullDate(Date.now(), 'MMM-D-YYYY').should.eql(moment().format('MMM-D-YYYY'));

    // page.lang
    ctx.page.lang = 'zh-tw';
    fullDate(Date.now(), 'LLL').should.eql(moment().locale('zh-tw').format('LLL'));
    ctx.page.lang = '';

    // config.language
    ctx.config.language = 'ja';
    fullDate(Date.now(), 'LLL').should.eql(moment().locale('ja').format('LLL'));
    ctx.config.language = '';

    // timezone
    ctx.config.timezone = 'UTC';
    fullDate().should.eql(moment().tz('UTC').format(fullDateFormat));
    ctx.config.timezone = '';
  });

  it('time_tag', () => {
    const ctx: any = {
      config: hexo.config,
      date: dateHelper,
      page: {}
    };

    const timeTag: (...args: TimeTagHelperParams) => TimeTagHelperReturn = time_tag.bind(ctx);

    function result(date?, format?) {
      date = date || new Date();
      format = format || hexo.config.date_format;
      return '<time datetime="' + moment(date).toISOString() + '">' + moment(date).format(format) + '</time>';
    }

    function check(date, format?) {
      format = format || hexo.config.date_format;
      timeTag(date, format).should.eql(result(date, format));
    }

    // now
    timeTag().should.eql(result());

    // moment
    check(moment());
    check(moment(), 'MMM-D-YYYY');

    // date
    check(new Date());
    check(new Date(), 'MMM-D-YYYY');

    // number
    check(Date.now());
    check(Date.now(), 'MMM-D-YYYY');

    // page.lang
    ctx.page.lang = 'zh-tw';
    timeTag(Date.now(), 'LLL').should.eql('<time datetime="' + moment().toISOString() + '">' + moment().locale('zh-tw').format('LLL') + '</time>');
    ctx.page.lang = '';

    // config.language
    ctx.config.language = 'ja';
    timeTag(Date.now(), 'LLL').should.eql('<time datetime="' + moment().toISOString() + '">' + moment().locale('ja').format('LLL') + '</time>');
    ctx.config.language = '';

    // timezone
    ctx.config.timezone = 'UTC';
    timeTag(Date.now(), 'LLL').should.eql('<time datetime="' + moment().toISOString() + '">' + moment().tz('UTC').format('LLL') + '</time>');
    ctx.config.timezone = '';
  });

  it('toMomentLocale', () => {
    (toMomentLocale(undefined) === undefined).should.be.true;
    // @ts-ignore
    toMomentLocale(null).should.eql('en');
    toMomentLocale('').should.eql('en');
    toMomentLocale('en').should.eql('en');
    toMomentLocale('default').should.eql('en');
    toMomentLocale('zh-CN').should.eql('zh-cn');
    toMomentLocale('zh_CN').should.eql('zh-cn');
  });
});
