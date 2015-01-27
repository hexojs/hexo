'use strict';

var should = require('chai').should();
var fs = require('hexo-fs');
var Promise = require('bluebird');

describe('Save database', function(){
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo();
  var saveDatabase = Promise.method(require('../../../lib/plugins/filter/before_exit/save_database')).bind(hexo);
  var dbPath = hexo.database.options.path;

  it('default', function(){
    hexo.env.init = true;

    return saveDatabase().then(function(){
      return fs.exists(dbPath);
    }).then(function(exist){
      exist.should.be.true;
      return fs.unlink(dbPath);
    });
  });

  it('do nothing if hexo is not initialized', function(){
    hexo.env.init = false;

    return saveDatabase().then(function(){
      return fs.exists(dbPath);
    }).then(function(exist){
      exist.should.be.false;
    });
  });
});