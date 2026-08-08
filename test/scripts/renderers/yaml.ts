import r from '../../../lib/plugins/renderer/yaml';
import chai from 'chai';
const should = chai.should();

describe('yaml', () => {
  it('normal', () => {
    r({text: 'foo: 1'}).should.eql({foo: 1});
  });

  it('escape', () => {
    const body = [
      'foo: 1',
      'bar:',
      '\tbaz: 3'
    ].join('\n');

    r({text: body}).should.eql({
      foo: 1,
      bar: {
        baz: 3
      }
    });
  });

  it('supports merge keys', () => {
    const body = [
      'defaults: &defaults',
      '  foo: 1',
      'bar:',
      '  <<: *defaults',
      '  baz: 2'
    ].join('\n');

    r({text: body}).should.eql({
      defaults: {foo: 1},
      bar: {foo: 1, baz: 2}
    });
  });

  it('parses timestamps as dates', () => {
    r({text: 'date: 2026-08-08'}).date.should.eql(new Date('2026-08-08'));
  });

  it('supports !!js/regexp', () => {
    const result = r({text: 'pattern: !!js/regexp /foo/gim'});

    result.pattern.should.be.instanceOf(RegExp);
    result.pattern.source.should.eql('foo');
    result.pattern.flags.should.eql('gim');
  });

  it('rejects !!js/function', () => {
    should.throw(
      () => r({text: 'fn: !!js/function function () { return 1; }'}),
      /Unresolved tag: tag:yaml.org,2002:js\/function/
    );
  });
});
