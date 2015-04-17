'use strict';

var should = require('chai').should();
var fs = require('hexo-fs');
var pathFn = require('path');
var mute = require('mute');

describe('help', function(){
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo(pathFn.join(__dirname, 'help_test'), {silent: true});
  var help = require('../../../lib/plugins/console/help').bind(hexo);

  before(function(){
    return fs.mkdirs(hexo.base_dir).then(function(){
      return hexo.init();
    });
  });

  after(function(){
    return fs.rmdir(hexo.base_dir);
  });
  
  // Only check that the error does not occur
  it('help list', function(){
    return mute(function(unmute) {
      help({_: ['list']});
      unmute();
    });
  });
});