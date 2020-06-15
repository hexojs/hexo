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
    }).should.matches(/^Hello world!\s*$/);
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

    // https://github.com/lodash/lodash/blob/master/test/toArray.test.js
    it('toArray can iterate on objects', () => {
      const data = {
        arr: { a: '1', b: '2', c: '3' }
      };

      r({ text: forLoop }, data).should.eql('123');
    });

    it('toArray can iterate on object string', () => {
      const data = {
        arr: Object('123')
      };

      r({ text: forLoop }, data).should.eql('123');
    });

    it('toArray can iterate on Map', () => {
      const data = {
        arr: new Map()
      };

      data.arr.set('a', 1);
      data.arr.set('b', 2);
      data.arr.set('c', 3);

      r({ text: forLoop }, data).should.eql('123');
    });

    it('toArray can iterate on Set', () => {
      const data = {
        arr: new Set()
      };

      data.arr.add(1);
      data.arr.add(2);
      data.arr.add(3);

      r({ text: forLoop }, data).should.eql('123');
    });

    it('safeDump undefined', () => {
      const text = [
        '{{ items | safeDump }}'
      ].join('\n');

      r({ text }).should.eql('""');
    });

    it('safeDump null', () => {
      const text = [
        '{% set items = null %}',
        '{{ items | safeDump }}'
      ].join('\n');

      r({ text }).should.eql('\n""');
    });

    // Adapt from nunjucks test cases
    // https://github.com/mozilla/nunjucks/blob/9a0ce364effd28fcdb3ab922fcffa9343b7b3630/tests/filters.js#L98
    it('safeDump default', () => {
      const text = [
        '{% set items = ["a", 1, { b : true}] %}',
        '{{ items | safeDump }}'
      ].join('\n');

      r({ text }).should.eql('\n["a",1,{"b":true}]');
    });

    it('safeDump spacer - 2', () => {
      const text = [
        '{% set items = ["a", 1, { b : true}] %}',
        '{{ items | safeDump(2) }}'
      ].join('\n');

      r({ text }).should.eql([
        '',
        '[',
        '  "a",',
        '  1,',
        '  {',
        '    "b": true',
        '  }',
        ']'
      ].join('\n'));
    });

    it('safeDump spacer - 2', () => {
      const text = [
        '{% set items = ["a", 1, { b : true}] %}',
        '{{ items | safeDump(2) }}'
      ].join('\n');

      r({ text }).should.eql([
        '',
        '[',
        '  "a",',
        '  1,',
        '  {',
        '    "b": true',
        '  }',
        ']'
      ].join('\n'));
    });

    it('safeDump spacer - 4', () => {
      const text = [
        '{% set items = ["a", 1, { b : true}] %}',
        '{{ items | safeDump(4) }}'
      ].join('\n');

      r({ text }).should.eql([
        '',
        '[',
        '    "a",',
        '    1,',
        '    {',
        '        "b": true',
        '    }',
        ']'
      ].join('\n'));
    });

    it('safeDump spacer - \\t', () => {
      const text = [
        '{% set items = ["a", 1, { b : true}] %}',
        '{{ items | safeDump(\'\t\') }}'
      ].join('\n');

      r({ text }).should.eql([
        '',
        '[',
        '\t"a",',
        '\t1,',
        '\t{',
        '\t\t"b": true',
        '\t}',
        ']'
      ].join('\n'));
    });
  });
});
