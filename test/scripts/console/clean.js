'use strict';

var should = require('chai').should();
var fs = require('hexo-fs');

describe('clean', function(){
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo(__dirname, {silent: true});
  var clean = require('../../../lib/plugins/console/clean').bind(hexo);

  it('delete database', function(){
    var dbPath = hexo.database.options.path;

    return fs.writeFile(dbPath, '').then(function(){
      return clean();
    }).then(function(){
      return fs.exists(dbPath);
    }).then(function(exist){
      exist.should.be.false;
    });
  });

  it('delete public folder', function(){
    var publicDir = hexo.public_dir;

    return fs.mkdirs(publicDir).then(function(){
      return clean();
    }).then(function(){
      return fs.exists(publicDir);
    }).then(function(exist){
      exist.should.be.false;
    });
  });
});