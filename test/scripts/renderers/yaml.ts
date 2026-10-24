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

  it('!!js/regexp type is enabled', () => {
    const result = r({text: 'foo: !!js/regexp /[a-z]+/gi'});
    result.foo.should.be.an.instanceOf(RegExp);
    result.foo.source.should.eql('[a-z]+');
    result.foo.flags.should.eql('gi');
  });

  it('!!js/undefined type is enabled', () => {
    should.not.exist(r({text: 'foo: !!js/undefined'}).foo);
  });

  it('!!js/function type is not enabled', () => {
    (() => r({text: 'foo: !!js/function "function () { return 1; }"'})).should.throw();
  });
});
