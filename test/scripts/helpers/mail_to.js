'use strict';

var should = require('chai').should(); // eslint-disable-line
var qs = require('querystring');

describe('mail_to', function() {
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo(__dirname);

  var ctx = {
    config: hexo.config
  };

  ctx.url_for = require('../../../lib/plugins/helper/url_for').bind(ctx);

  var mailto = require('../../../lib/plugins/helper/mail_to').bind(ctx);

  it('path', function() {
    mailto('abc@example.com').should.eql('<a href="mailto:abc@example.com" title="abc@example.com">abc@example.com</a>');
  });

  it('text', function() {
    mailto('abc@example.com', 'Email').should.eql('<a href="mailto:abc@example.com" title="Email">Email</a>');
  });

  it('subject', function() {
    mailto('abc@example.com', 'Email', {subject: 'Hello'})
      .should.eql('<a href="mailto:abc@example.com?subject=Hello" title="Email">Email</a>');
  });

  it('cc (string)', function() {
    var data = {cc: 'abc@abc.com'};
    var querystring = qs.stringify(data);

    mailto('abc@example.com', 'Email', {cc: 'abc@abc.com'})
      .should.eql('<a href="mailto:abc@example.com?' + querystring + '" title="Email">Email</a>');
  });

  it('cc (array)', function() {
    var data = {cc: 'abc@abc.com,bcd@bcd.com'};
    var querystring = qs.stringify(data);

    mailto('abc@example.com', 'Email', {cc: ['abc@abc.com', 'bcd@bcd.com']})
      .should.eql('<a href="mailto:abc@example.com?' + querystring + '" title="Email">Email</a>');
  });

  it('bcc (string)', function() {
    var data = {bcc: 'abc@abc.com'};
    var querystring = qs.stringify(data);

    mailto('abc@example.com', 'Email', {bcc: 'abc@abc.com'})
      .should.eql('<a href="mailto:abc@example.com?' + querystring + '" title="Email">Email</a>');
  });

  it('bcc (array)', function() {
    var data = {bcc: 'abc@abc.com,bcd@bcd.com'};
    var querystring = qs.stringify(data);

    mailto('abc@example.com', 'Email', {bcc: ['abc@abc.com', 'bcd@bcd.com']})
      .should.eql('<a href="mailto:abc@example.com?' + querystring + '" title="Email">Email</a>');
  });

  it('body', function() {
    mailto('abc@example.com', 'Email', {body: 'Hello'})
      .should.eql('<a href="mailto:abc@example.com?body=Hello" title="Email">Email</a>');
  });

  it('class (string)', function() {
    mailto('abc@example.com', 'Email', {class: 'foo'})
      .should.eql('<a href="mailto:abc@example.com" title="Email" class="foo">Email</a>');
  });

  it('class (array)', function() {
    mailto('abc@example.com', 'Email', {class: ['foo', 'bar']})
      .should.eql('<a href="mailto:abc@example.com" title="Email" class="foo bar">Email</a>');
  });

  it('id', function() {
    mailto('abc@example.com', 'Email', {id: 'foo'})
      .should.eql('<a href="mailto:abc@example.com" title="Email" id="foo">Email</a>');
  });
});
