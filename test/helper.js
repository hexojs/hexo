var moment = require('moment'),
  should = require('should'),
  crypto = require('crypto');

describe('Helper', function(){
  var config = hexo.config;

  describe('css', function(){
    var css = require('../lib/plugins/helper/css');

    var genResult = function(arr){
      var result = [];

      arr.forEach(function(item){
        result.push('<link rel="stylesheet" href="' + item + '.css" type="text/css">');
      });

      return result.join('\n');
    };

    it('a string', function(){
      var result = genResult(['/style']);

      css('style').should.be.eql(result);
      css('style.css').should.be.eql(result);

      css('http://zespia.tw/style.css').should.be.eql(genResult(['http://zespia.tw/style']));
      css('//zespia.tw/style.css').should.be.eql(genResult(['//zespia.tw/style']));
    });

    it('an array', function(){
      var result = genResult(['/foo', '/bar', '/baz']);

      css(['foo', 'bar', 'baz']).should.be.eql(result);
    });

    it('multiple strings', function(){
      var result = genResult(['/foo', '/bar', '/baz']);

      css('foo', 'bar', 'baz').should.be.eql(result);
    });

    it('multiple arrays', function(){
      var result = genResult(['/s1', '/s2', '/s3', '/s4', '/s5', '/s6']);

      css(['s1', 's2', 's3'], ['s4', 's5'], ['s6']).should.be.eql(result);
    });

    it('mixed', function(){
      var result = genResult(['/s1', '/s2', '/s3', '/s4', '/s5', '/s6']);

      css(['s1', 's2'], 's3', 's4', ['s5'], 's6').should.be.eql(result);
    });
  });

  describe('date', function(){
    var date = require('../lib/plugins/helper/date');

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
      date.date(nowDate).should.be.eql(moment(nowDate).format(format));
      date.date(nowDate, custom).should.be.eql(moment(nowDate).format(custom));

      var nowMoment = moment();
      date.date(nowMoment).should.be.eql(nowMoment.format(format));
      date.date(nowMoment, custom).should.be.eql(nowMoment.format(custom));

      var nowMs = Date.now();
      date.date(nowMs).should.be.eql(moment(nowMs).format(format));
      date.date(nowMs, custom).should.be.eql(moment(nowMs).format(custom));
    });

    it('date_xml', function(){
      date.date_xml().should.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);

      var nowDate = new Date();
      date.date_xml(nowDate).should.be.eql(nowDate.toISOString());

      var nowMoment = moment();
      date.date_xml(nowMoment).should.be.eql(nowMoment.toDate().toISOString());

      var nowMs = Date.now();
      date.date_xml(nowMs).should.be.eql(new Date(nowMs).toISOString());
    });

    it('time', function(){
      var format = config.time_format,
        custom = 'H:mm';

      moment(date.time(), format).isValid().should.be.true;

      var nowDate = new Date();
      date.time(nowDate).should.be.eql(moment(nowDate).format(format));
      date.time(nowDate, custom).should.be.eql(moment(nowDate).format(custom));

      var nowMoment = moment();
      date.time(nowMoment).should.be.eql(nowMoment.format(format));
      date.time(nowMoment, custom).should.be.eql(nowMoment.format(custom));

      var nowMs = Date.now();
      date.time(nowMs).should.be.eql(moment(nowMs).format(format));
      date.time(nowMs, custom).should.be.eql(moment(nowMs).format(custom));

    });

    it('full_date', function(){
      var format = config.date_format + ' ' + config.time_format,
        custom = 'YYYY-MM-DD H:mm';

      moment(date.full_date(), format).isValid().should.be.true;

      var nowDate = new Date();
      date.full_date(nowDate).should.be.eql(moment(nowDate).format(format));
      date.full_date(nowDate, custom).should.be.eql(moment(nowDate).format(custom));

      var nowMoment = moment();
      date.full_date(nowMoment).should.be.eql(nowMoment.format(format));
      date.full_date(nowMoment, custom).should.be.eql(nowMoment.format(custom));

      var nowMs = Date.now();
      date.full_date(nowMs).should.be.eql(moment(nowMs).format(format));
      date.full_date(nowMs, custom).should.be.eql(moment(nowMs).format(custom));
    });

    it('time_tag', function(){
      var format = config.date_format,
        custom = 'YYYY-MM-DD';

      var nowDate = new Date();
      date.time_tag(nowDate).should.be.eql(genTimeTag(nowDate, format));
      date.time_tag(nowDate, custom).should.be.eql(genTimeTag(nowDate, custom));

      var nowMoment = moment();
      date.time_tag(nowMoment).should.be.eql(genTimeTag(nowMoment, format));
      date.time_tag(nowMoment, custom).should.be.eql(genTimeTag(nowMoment, custom));

      var nowMs = Date.now();
      date.time_tag(nowMs).should.be.eql(genTimeTag(nowMs, format));
      date.time_tag(nowMs, custom).should.be.eql(genTimeTag(nowMs, custom));
    });

    it('moment', function(){
      moment.isMoment(new date.moment()).should.be.true;
    });
  });

  describe('form', function(){
    var form = require('../lib/plugins/helper/form');

    describe('search_form', function(){
      var search_form = form.search_form;

      it('default', function(){
        search_form().should.be.eql('<form action="//google.com/search" method="get" accept-charset="UTF-8" class="search-form"><input type="text" name="q" results="0" class="search-form-input" placeholder="Search"><input type="hidden" name="q" value="site:' + config.url + '"></form>');
      });

      it('class', function(){
        search_form({class: 'custom'}).should.be.eql('<form action="//google.com/search" method="get" accept-charset="UTF-8" class="custom"><input type="text" name="q" results="0" class="custom-input" placeholder="Search"><input type="hidden" name="q" value="site:http://yoursite.com"></form>');
      });

      it('text', function(){
        search_form({text: 'Search...'}).should.be.eql('<form action="//google.com/search" method="get" accept-charset="UTF-8" class="search-form"><input type="text" name="q" results="0" class="search-form-input" placeholder="Search..."><input type="hidden" name="q" value="site:http://yoursite.com"></form>');
      });

      it('button', function(){
        search_form({button: true}).should.be.eql('<form action="//google.com/search" method="get" accept-charset="UTF-8" class="search-form"><input type="text" name="q" results="0" class="search-form-input" placeholder="Search"><input type="submit" value="Search" class="search-form-submit"><input type="hidden" name="q" value="site:http://yoursite.com"></form>');
        search_form({button: 'Button'}).should.be.eql('<form action="//google.com/search" method="get" accept-charset="UTF-8" class="search-form"><input type="text" name="q" results="0" class="search-form-input" placeholder="Search"><input type="submit" value="Button" class="search-form-submit"><input type="hidden" name="q" value="site:http://yoursite.com"></form>');
      });
    });
  });

  describe('gravatar', function(){
    var gravatar = require('../lib/plugins/helper/gravatar');

    var md5 = function(str){
      return crypto.createHash('md5').update(str).digest('hex');
    };

    var email = 'abc@abc.com',
      hash = md5(email);

    it('default', function(){
      gravatar(email).should.be.eql('http://www.gravatar.com/avatar/' + hash);
    });

    it('size', function(){
      gravatar(email, 100).should.be.eql('http://www.gravatar.com/avatar/' + hash + '?s=100');
    });

    it('options', function(){
      gravatar(email, {
        s: 200,
        r: 'pg',
        d: 'mm'
      }).should.be.eql('http://www.gravatar.com/avatar/' + hash + '?s=200&r=pg&d=mm');
    });
  });

  describe('is', function(){
    var is = require('../lib/plugins/helper/is');

    it('is_current', function(){
      is.is_current.call({path: 'foo/bar', config: config}, 'foo').should.be.true;
      is.is_current.call({path: 'foo/bar', config: config}, 'foo/bar').should.be.true;
      is.is_current.call({path: 'foo/bar', config: config}, 'foo/baz').should.be.false;
    });

    it('is_home', function(){
      var paginationDir = config.pagination_dir;

      is.is_home.call({path: '', config: config}).should.be.true;
      is.is_home.call({path: paginationDir + '/2/', config: config}).should.be.true;
    });

    it('is_post', function(){
      var config = {
        permalink: ':id/:category/:year/:month/:day/:title'
      };

      is.is_post.call({path: '123/foo/bar/2013/08/12/foo-bar', config: config}).should.be.true;
    });

    it('is_archive', function(){
      var archiveDir = config.archive_dir;

      is.is_archive.call({path: archiveDir + '/', config: config}).should.be.true;
      is.is_archive.call({path: archiveDir + '/2013', config: config}).should.be.true;
      is.is_archive.call({path: archiveDir + '/2013/08', config: config}).should.be.true;
    });

    it('is_year', function(){
      is.is_archive.call({path: config.archive_dir + '/2013', config: config}).should.be.true;
    });

    it('is_month', function(){
      is.is_archive.call({path: config.archive_dir + '/2013/08', config: config}).should.be.true;
    });

    it('is_category', function(){
      is.is_category.call({path: config.category_dir + '/foo', config: config}).should.be.true;
    });

    it('is_tag', function(){
      is.is_tag.call({path: config.tag_dir + '/foo', config: config}).should.be.true;
    });
  });

  describe('js', function(){
    var js = require('../lib/plugins/helper/js');

    var genResult = function(arr){
      var result = [];

      arr.forEach(function(item){
        result.push('<script type="text/javascript" src="' + item + '.js"></script>');
      });

      return result.join('\n');
    };

    it('a string', function(){
      var result = genResult(['/script']);

      js('script').should.be.eql(result);
      js('script.js').should.be.eql(result);

      js('http://code.jquery.com/jquery-2.0.3.min.js').should.be.eql(genResult(['http://code.jquery.com/jquery-2.0.3.min']));
      js('//code.jquery.com/jquery-2.0.3.min.js').should.be.eql(genResult(['//code.jquery.com/jquery-2.0.3.min']));
    });

    it('an array', function(){
      var result = genResult(['/foo', '/bar', '/baz']);

      js(['foo', 'bar', 'baz']).should.be.eql(result);
    });

    it('multiple strings', function(){
      var result = genResult(['/foo', '/bar', '/baz']);

      js('foo', 'bar', 'baz').should.be.eql(result);
    });

    it('multiple arrays', function(){
      var result = genResult(['/s1', '/s2', '/s3', '/s4', '/s5', '/s6']);

      js(['s1', 's2', 's3'], ['s4', 's5'], ['s6']).should.be.eql(result);
    });

    it('mixed', function(){
      var result = genResult(['/s1', '/s2', '/s3', '/s4', '/s5', '/s6']);

      js(['s1', 's2'], 's3', 's4', ['s5'], 's6').should.be.eql(result);
    });
  });

  describe('link', function(){
    var link = require('../lib/plugins/helper/link');

    describe('link_to', function(){
      var link_to = link.link_to,
        url = 'http://zespia.tw/',
        text = 'Zespia';

      it('path', function(){
        link_to(url).should.be.eql('<a href="' + url + '" title="' + url + '">' + url + '</a>');
      });

      it('text', function(){
        link_to(url, text).should.be.eql('<a href="' + url + '" title="' + text + '">' + text + '</a>');
      });

      it('external', function(){
        link_to(url, text, true).should.be.eql('<a href="' + url + '" title="' + text + '" target="_blank" rel="external">' + text + '</a>');
      });
    });

    describe('mail_to', function(){
      var mail_to = link.mail_to,
        url = 'abc@abc.com',
        text = 'Email';

      it('path', function(){
        mail_to(url).should.be.eql('<a href="mailto:' + url + '" title="' + url + '">' + url + '</a>');
      });

      it('text', function(){
        mail_to(url, text).should.be.eql('<a href="mailto:' + url + '" title="' + text + '">' + text + '</a>');
      });
    });
  });

  describe('number', function(){
    var number = require('../lib/plugins/helper/number');

    describe('number_format', function(){
      it('default', function(){
        number.number_format(1234.567).should.be.eql('1,234.567');
      });

      it('precision', function(){
        number.number_format(1234.567, {precision: false}).should.be.eql('1,234.567');
        number.number_format(1234.567, {precision: 0}).should.be.eql('1,234');
        number.number_format(1234.567, {precision: 1}).should.be.eql('1,234.6');
        number.number_format(1234.567, {precision: 2}).should.be.eql('1,234.57');
        number.number_format(1234.567, {precision: 3}).should.be.eql('1,234.567');
        number.number_format(1234.567, {precision: 4}).should.be.eql('1,234.5670');
      });

      it('delimiter', function(){
        number.number_format(1234.567, {delimiter: ' '}).should.be.eql('1 234.567');
      });

      it('separator', function(){
        number.number_format(1234.567, {separator: '*'}).should.be.eql('1,234*567');
      });
    });
  });
});