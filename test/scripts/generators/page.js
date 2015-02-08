'use strict';

var should = require('chai').should();
var Promise = require('bluebird');

describe('page', function(){
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo(__dirname, {silent: true});
  var Page = hexo.model('Page');
  var generator = Promise.method(require('../../../lib/plugins/generator/page').bind(hexo));

  function locals(){
    hexo.locals.invalidate();
    return hexo.locals.toObject();
  }

  it('default layout', function(){
    return Page.insert({
      source: 'foo',
      path: 'bar'
    }).then(function(page){
      return generator(locals()).then(function(data){
        data.should.eql([
          {
            path: page.path,
            layout: ['page', 'post', 'index'],
            data: page
          }
        ]);

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
      return generator(locals()).then(function(data){
        data[0].layout.should.eql(['photo', 'page', 'post', 'index']);

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
      return generator(locals()).then(function(data){
        should.not.exist(data[0].layout);

        return page.remove();
      });
    });
  });

  it('skip render', function(){
    hexo.config.skip_render = 'lab/**/*.js';

    return Page.insert({
      source: 'lab/assets/jquery.min.js',
      path: 'lab/assets/jquery.min.js',
      layout: false,
      raw: 'jquery raw'
    }).then(function(page){
      return generator(locals()).then(function(data){
        data.should.eql([
          {path: page.source, data: page.raw}
        ]);

        hexo.config.skip_render = [];
        return page.remove();
      });
    });
  });

  it('skip render - multiple rules', function(){
    hexo.config.skip_render = ['lab/**/*.js'];

    return Page.insert({
      source: 'lab/assets/jquery.min.js',
      path: 'lab/assets/jquery.min.js',
      layout: false,
      raw: 'jquery raw'
    }).then(function(page){
      return generator(locals()).then(function(data){
        data.should.eql([
          {path: page.source, data: page.raw}
        ]);

        hexo.config.skip_render = [];
        return page.remove();
      });
    });
  });

  it('skip render - don\'t replace extension name', function(){
    hexo.config.skip_render = 'README.md';

    return Page.insert({
      source: 'README.md',
      path: 'README.html',
      layout: 'page',
      raw: 'readme raw'
    }).then(function(page){
      return generator(locals()).then(function(data){
        data.should.eql([
          {path: page.source, data: page.raw}
        ]);

        hexo.config.skip_render = [];
        return page.remove();
      });
    });
  });
});