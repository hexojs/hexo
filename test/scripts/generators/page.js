'use strict';

var should = require('chai').should();
var Promise = require('bluebird');

describe('page', function(){
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo(__dirname, {silent: true});
  var Page = hexo.model('Page');
  var generator = Promise.method(require('../../../lib/plugins/generator/page').bind(hexo));

  it('default layout', function(){
    return Page.insert({
      source: 'foo',
      path: 'bar'
    }).then(function(page){
      return generator(hexo.locals).then(function(data){
        data.should.eql([
          {
            path: page.path,
            layout: ['page', 'post', 'index'],
            data: page
          }
        ]);
      }).then(function(){
        return page.remove();
      });
    });
  });

  it('custom layout', function(){
    return Page.insert({
      source: 'foo',
      path: 'bar',
      layout: 'photo'
    }).then(function(page){
      return generator(hexo.locals).then(function(data){
        data[0].layout.should.eql(['photo', 'page', 'post', 'index']);
      }).then(function(){
        return page.remove();
      });
    });
  });

  it('layout disabled', function(){
    return Page.insert({
      source: 'foo',
      path: 'bar',
      layout: false
    }).then(function(page){
      return generator(hexo.locals).then(function(data){
        should.not.exist(data[0].layout);
      }).then(function(){
        return page.remove();
      });
    });
  });
});