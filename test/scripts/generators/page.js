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
      return generator(hexo.locals, function(path, layouts, locals){
        path.should.eql(page.path);
        layouts.should.eql(['page', 'post', 'index']);
        locals._id.should.eql(page._id);
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
      return generator(hexo.locals, function(path, layouts, locals){
        layouts.should.eql(['photo', 'page', 'post', 'index']);
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
      return generator(hexo.locals).then(function(){
        var route = hexo.route.get(page.path);

        route(function(err, result){
          should.not.exist(err);
          result.should.eql(page.content);
        });

        return page.remove();
      });
    });
  });
});