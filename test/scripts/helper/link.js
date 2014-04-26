var should = require('chai').should();

describe('Helper - link', function(){
  var link = require('../../../lib/plugins/helper/link');

  describe('link_to', function(){
    var link_to = link.link_to,
      url = 'http://zespia.tw/',
      text = 'Zespia';

    it('path', function(){
      link_to(url).should.eql('<a href="' + url + '" title="' + url + '">' + url + '</a>');
    });

    it('text', function(){
      link_to(url, text).should.eql('<a href="' + url + '" title="' + text + '">' + text + '</a>');
    });

    it('external', function(){
      link_to(url, text, true).should.eql('<a href="' + url + '" title="' + text + '" target="_blank" rel="external">' + text + '</a>');
    });
  });

  describe('mail_to', function(){
    var mail_to = link.mail_to,
      url = 'abc@abc.com',
      text = 'Email';

    it('path', function(){
      mail_to(url).should.eql('<a href="mailto:' + url + '" title="' + url + '">' + url + '</a>');
    });

    it('text', function(){
      mail_to(url, text).should.eql('<a href="mailto:' + url + '" title="' + text + '">' + text + '</a>');
    });
  });
});