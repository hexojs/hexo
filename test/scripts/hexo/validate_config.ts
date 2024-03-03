import { spy } from 'sinon';
import Hexo from '../../../lib/hexo';
import validateConfig from '../../../lib/hexo/validate_config';
import defaultConfig from '../../../lib/hexo/default_config';
import chai from 'chai';
const should = chai.should();

describe('Validate config', () => {
  const hexo = new Hexo();
  let logSpy;

  beforeEach(() => {
    logSpy = spy();
    hexo.config = JSON.parse(JSON.stringify(defaultConfig));
    hexo.log.warn = logSpy;
    hexo.log.info = spy();
  });

  it('config.url - undefined', () => {
    // @ts-ignore
    delete hexo.config.url;

    try {
      validateConfig(hexo);
      should.fail();
    } catch (e) {
      e.name.should.eql('TypeError');
      e.message.should.eql('Invalid config detected: "url" should be string, not undefined!');
    }
  });

  it('config.url - wrong type', () => {
    // @ts-ignore
    hexo.config.url = true;

    try {
      validateConfig(hexo);
      should.fail();
    } catch (e) {
      e.name.should.eql('TypeError');
      e.message.should.eql('Invalid config detected: "url" should be string, not boolean!');
    }
  });

  it('config.url - empty', () => {
    hexo.config.url = ' ';

    try {
      validateConfig(hexo);
      should.fail();
    } catch (e) {
      e.name.should.eql('TypeError');
      e.message.should.eql('Invalid config detected: "url" should be a valid URL!');
    }
  });

  // #4510
  it('config.url - slash', () => {
    hexo.config.url = '/';

    try {
      validateConfig(hexo);
      should.fail();
    } catch (e) {
      e.name.should.eql('TypeError');
      e.message.should.eql('Invalid config detected: "url" should be a valid URL!');
    }
  });

  it('config.root - undefined', () => {
    // @ts-ignore
    delete hexo.config.root;

    try {
      validateConfig(hexo);
      should.fail();
    } catch (e) {
      e.name.should.eql('TypeError');
      e.message.should.eql('Invalid config detected: "root" should be string, not undefined!');
    }
  });

  it('config.root - wrong type', () => {
    // @ts-ignore
    hexo.config.root = true;

    try {
      validateConfig(hexo);
      should.fail();
    } catch (e) {
      e.name.should.eql('TypeError');
      e.message.should.eql('Invalid config detected: "root" should be string, not boolean!');
    }
  });

  it('config.root - empty', () => {
    hexo.config.root = ' ';

    try {
      validateConfig(hexo);
      should.fail();
    } catch (e) {
      e.name.should.eql('TypeError');
      e.message.should.eql('Invalid config detected: "root" should not be empty!');
    }
  });
});
