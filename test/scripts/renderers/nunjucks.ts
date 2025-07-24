import r from '../../../lib/plugins/renderer/nunjucks';
import { dirname, join } from 'path';
import chai from 'chai';
const _should = chai.should();


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
      '{% for x in arr | toarray %}',
      '{{ x }}',
      '{% endfor %}'
    ].join('');

    it('toarray can iterate on Warehouse collections', () => {
      const data = {
        arr: {
          toArray() {
            return [1, 2, 3];
          }
        }
      };

      r({ text: forLoop }, data).should.eql('123');
    });

    it('toarray can iterate on plain array', () => {
      const data = {
        arr: [1, 2, 3]
      };

      r({ text: forLoop }, data).should.eql('123');
    });

    it('toarray can iterate on string', () => {
      const data = {
        arr: '123'
      };

      r({ text: forLoop }, data).should.eql('123');
    });

    // https://github.com/lodash/lodash/blob/master/test/toarray.test.js
    it('toarray can iterate on objects', () => {
      const data = {
        arr: { a: '1', b: '2', c: '3' }
      };

      r({ text: forLoop }, data).should.eql('123');
    });

    it('toarray can iterate on object string', () => {
      const data = {
        arr: Object('123')
      };

      r({ text: forLoop }, data).should.eql('123');
    });

    it('toarray can iterate on Map', () => {
      const data = {
        arr: new Map()
      };

      data.arr.set('a', 1);
      data.arr.set('b', 2);
      data.arr.set('c', 3);

      r({ text: forLoop }, data).should.eql('123');
    });

    it('toarray can iterate on Set', () => {
      const data = {
        arr: new Set()
      };

      data.arr.add(1);
      data.arr.add(2);
      data.arr.add(3);

      r({ text: forLoop }, data).should.eql('123');
    });

    it('toarray other case', () => {
      const data = {
        arr: 1
      };

      r({ text: forLoop }, data).should.eql('');
    });

    it('safedump undefined', () => {
      const text = [
        '{{ items | safedump }}'
      ].join('\n');

      r({ text }).should.eql('""');
    });

    it('safedump null', () => {
      const text = [
        '{% set items = null %}',
        '{{ items | safedump }}'
      ].join('\n');

      r({ text }).should.eql('\n""');
    });

    // Adapt from nunjucks test cases
    // https://github.com/mozilla/nunjucks/blob/9a0ce364effd28fcdb3ab922fcffa9343b7b3630/tests/filters.js#L98
    it('safedump default', () => {
      const text = [
        '{% set items = ["a", 1, { b : true}] %}',
        '{{ items | safedump }}'
      ].join('\n');

      r({ text }).should.eql('\n["a",1,{"b":true}]');
    });

    it('safedump spacer - 2', () => {
      const text = [
        '{% set items = ["a", 1, { b : true}] %}',
        '{{ items | safedump(2) }}'
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

    it('safedump spacer - 2', () => {
      const text = [
        '{% set items = ["a", 1, { b : true}] %}',
        '{{ items | safedump(2) }}'
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

    it('safedump spacer - 4', () => {
      const text = [
        '{% set items = ["a", 1, { b : true}] %}',
        '{{ items | safedump(4) }}'
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

    it('safedump spacer - \\t', () => {
      const text = [
        '{% set items = ["a", 1, { b : true}] %}',
        '{{ items | safedump(\'\t\') }}'
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
