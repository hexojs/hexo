'use strict';

const { spy } = require('sinon');

describe('Validate config', () => {
  const Hexo = require('../../../lib/hexo');
  const hexo = new Hexo();
  const validateConfig = require('../../../lib/hexo/validate_config');
  const defaultConfig = require('../../../lib/hexo/default_config');
  let logSpy;

  beforeEach(() => {
    logSpy = spy();
    hexo.config = JSON.parse(JSON.stringify(defaultConfig));
    hexo.log.warn = logSpy;
    hexo.log.info = spy();
  });

  it('config.url - undefined', () => {
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
      e.message.should.eql('Invalid config detected: "url" should not be empty!');
    }
  });

  it('config.root - undefined', () => {
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

  it('config.use_date_for_updated - depreacte', () => {
    hexo.config.use_date_for_updated = true;

    validateConfig(hexo);

    logSpy.calledOnce.should.be.true;
    logSpy.calledWith('Deprecated config detected: "use_date_for_updated" is deprecated, please use "updated_option" instead. See https://hexo.io/docs/configuration for more details.').should.be.true;
  });

  it('config.external_link - depreacte Boolean value', () => {
    hexo.config.external_link = false;

    validateConfig(hexo);

    logSpy.calledOnce.should.be.true;
    logSpy.calledWith('Deprecated config detected: "external_link" with a Boolean value is deprecated. See https://hexo.io/docs/configuration for more details.').should.be.true;
  });
});
