'use strict';

var should = require('chai').should();
var fs = require('hexo-fs');
var pathFn = require('path');
var sinon = require('sinon');

describe('help', function(){
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo(pathFn.join(__dirname, 'help_test'), {silent: true});
  var help = require('../../../lib/plugins/console/help').bind(hexo);

  before(function(){
    return fs.mkdirs(hexo.base_dir).then(function(){
      return hexo.init();
    });
  });

  beforeEach(function() {
    sinon.stub(console, "log").returns(void 0);
    sinon.stub(console, "error").returns(void 0);
  });

  afterEach(function() {
    console.log.restore();
  });

  after(function(){
    return fs.rmdir(hexo.base_dir);
  });

  // Only check that the error does not occur
  it('help list', function(){
    return help({_: ['list']});
  });
});