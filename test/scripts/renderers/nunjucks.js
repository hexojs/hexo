'use strict';

require('chai').should();
const r = require('../../../lib/plugins/renderer/nunjucks');
const { dirname, join } = require('path');

describe('nunjucks', () => {
  const fixturePath = join(dirname(dirname(__dirname)), 'fixtures', 'hello.njk');

  it('render from string', () => {
    const body = [
      'Hello {{ name }}!'
    ].join('\n');

    r({ text: body }, {
      name: 'world'
    }).should.eql('Hello world!');
  });

  it('render from path', () => {
    r({ path: fixturePath }, {
      name: 'world'
    }).should.eql('Hello world!\n');
  });

  it('compile from text', () => {
    const body = [
      'Hello {{ name }}!'
    ].join('\n');

    const render = r.compile({
      text: body
    });

    render({
      name: 'world'
    }).should.eql('Hello world!');
  });

  it('compile from an .njk file', () => {
    const render = r.compile({
      path: fixturePath
    });

    render({
      name: 'world'
    }).should.eql('Hello world!\n');
  });

  describe('nunjucks filters', () => {
    const forLoop = [
      '{% for x in arr | toArray %}',
      '{{ x }}',
      '{% endfor %}'
    ].join('');

    it('toArray can iterate on Warehouse collections', () => {
      const data = {
        arr: {
          toArray() {
            return [1, 2, 3];
          }
        }
      };

      r({ text: forLoop }, data).should.eql('123');
    });

    it('toArray can iterate on plain array', () => {
      const data = {
        arr: [1, 2, 3]
      };

      r({ text: forLoop }, data).should.eql('123');
    });

    it('toArray can iterate on string', () => {
      const data = {
        arr: '123'
      };

      r({ text: forLoop }, data).should.eql('123');
    });
  });
});
