'use strict';

var should = require('chai').should(); // eslint-disable-line
var Promise = require('bluebird');

describe('page', function() {
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo(__dirname, {silent: true});
  var Page = hexo.model('Page');
  var generator = Promise.method(require('../../../lib/plugins/generator/page').bind(hexo));

  function locals() {
    hexo.locals.invalidate();
    return hexo.locals.toObject();
  }

  it('default layout', function() {
    return Page.insert({
      source: 'foo',
      path: 'bar'
    }).then(function(page) {
      return generator(locals()).then(function(data) {
        page.__page = true;

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

  it('custom layout', function() {
    return Page.insert({
      source: 'foo',
      path: 'bar',
      layout: 'photo'
    }).then(function(page) {
      return generator(locals()).then(function(data) {
        data[0].layout.should.eql(['photo', 'page', 'post', 'index']);

        return page.remove();
      });
    });
  });

  [false, 'false', 'off'].forEach(function(layout) {
    it('layout = ' + JSON.stringify(layout), function() {
      return Page.insert({
        source: 'foo',
        path: 'bar',
        layout: layout
      }).then(function(page) {
        return generator(locals()).then(function(data) {
          should.not.exist(data[0].layout);
        }).finally(function() {
          return page.remove();
        });
      });
    });
  });
});
