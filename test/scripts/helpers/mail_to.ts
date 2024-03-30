import Hexo from '../../../lib/hexo';
import mailToHelper from '../../../lib/plugins/helper/mail_to';
type MailToHelperParams = Parameters<typeof mailToHelper>;
type MailToHelperReturn = ReturnType<typeof mailToHelper>;

describe('mail_to', () => {
  const hexo = new Hexo(__dirname);

  const ctx: any = {
    config: hexo.config
  };

  const mailto: (...args: MailToHelperParams) => MailToHelperReturn = mailToHelper.bind(ctx);

  it('path', () => {
    mailto('abc@example.com').should.eql('<a href="mailto:abc@example.com" title="abc@example.com">abc@example.com</a>');
  });

  it('path - array', () => {
    const emails = ['abc@example.com', 'foo@example.com'];
    const emailsStr = 'abc@example.com,foo@example.com';
    mailto(emails).should.eql(`<a href="mailto:${emailsStr}" title="${emailsStr}">${emailsStr}</a>`);
  });

  it('text', () => {
    mailto('abc@example.com', 'Email').should.eql('<a href="mailto:abc@example.com" title="Email">Email</a>');
  });

  it('subject', () => {
    mailto('abc@example.com', 'Email', {subject: 'Hello'})
      .should.eql('<a href="mailto:abc@example.com?subject=Hello" title="Email">Email</a>');
  });

  it('cc (string)', () => {
    const data = {cc: 'abc@abc.com'};
    const querystring = new URLSearchParams(data).toString();

    mailto('abc@example.com', 'Email', {cc: 'abc@abc.com'})
      .should.eql('<a href="mailto:abc@example.com?' + querystring + '" title="Email">Email</a>');
  });

  it('cc (array)', () => {
    const data = {cc: 'abc@abc.com,bcd@bcd.com'};
    const querystring = new URLSearchParams(data).toString();

    mailto('abc@example.com', 'Email', {cc: ['abc@abc.com', 'bcd@bcd.com']})
      .should.eql('<a href="mailto:abc@example.com?' + querystring + '" title="Email">Email</a>');
  });

  it('bcc (string)', () => {
    const data = {bcc: 'abc@abc.com'};
    const querystring = new URLSearchParams(data).toString();

    mailto('abc@example.com', 'Email', {bcc: 'abc@abc.com'})
      .should.eql('<a href="mailto:abc@example.com?' + querystring + '" title="Email">Email</a>');
  });

  it('bcc (array)', () => {
    const data = {bcc: 'abc@abc.com,bcd@bcd.com'};
    const querystring = new URLSearchParams(data).toString();

    mailto('abc@example.com', 'Email', {bcc: ['abc@abc.com', 'bcd@bcd.com']})
      .should.eql('<a href="mailto:abc@example.com?' + querystring + '" title="Email">Email</a>');
  });

  it('body', () => {
    mailto('abc@example.com', 'Email', {body: 'Hello'})
      .should.eql('<a href="mailto:abc@example.com?body=Hello" title="Email">Email</a>');
  });

  it('class (string)', () => {
    mailto('abc@example.com', 'Email', {class: 'foo'})
      .should.eql('<a href="mailto:abc@example.com" title="Email" class="foo">Email</a>');
  });

  it('class (array)', () => {
    mailto('abc@example.com', 'Email', {class: ['foo', 'bar']})
      .should.eql('<a href="mailto:abc@example.com" title="Email" class="foo bar">Email</a>');
  });

  it('id', () => {
    mailto('abc@example.com', 'Email', {id: 'foo'})
      .should.eql('<a href="mailto:abc@example.com" title="Email" id="foo">Email</a>');
  });
});
