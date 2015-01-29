'use strict';

var should = require('chai').should();
var Promise = require('bluebird');
var pathFn = require('path');
var fs = require('hexo-fs');

describe.skip('Stop watchers', function(){
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo(pathFn.join(__dirname, 'stop_watcher_test'));
  var stopWatcher = require('../../../lib/plugins/filter/before_exit/stop_watcher').bind(hexo);

  before(function(){
    return Promise.all([
      fs.mkdirs(hexo.source_dir),
      fs.mkdirs(hexo.theme_dir)
    ]);
  });

  after(function(){
    return fs.rmdir(hexo.base_dir);
  });

  it('default', function(){
    return Promise.all([
      hexo.source.watch(),
      hexo.theme.watch()
    ]).then(function(){
      return stopWatcher();
    }).then(function(){
      hexo.source.isWatching().should.be.false;
      hexo.theme.isWatching().should.be.false;
    })
  });
});