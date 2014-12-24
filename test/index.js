var file = require('../lib/util/file2'),
  fs = require('graceful-fs'),
  should = require('chai').should(),
  hexo = require('../lib/hexo'),
  pathFn = require('path');

describe('Hexo test', function(){
  before(require('./scripts/init'));

  require('./scripts/core');
  require('./scripts/util');
  require('./scripts/i18n');
  require('./scripts/filter');
  require('./scripts/helper');
  require('./scripts/tag');
  require('./scripts/post');
  require('./scripts/scaffold');

  describe('init', function() {
    it('should work with a command argument', function() {
      var rv = hexo.init({command: {one: 'one'}});
      rv.env.args.command.one.should.eql('one');
    });
  });

  after(function(done){
    var blogDir = pathFn.join(__dirname, 'blog');

    fs.exists(blogDir, function(exist){
      if (exist){
        file.rmdir(blogDir, done);
      } else {
        done();
      }
    });
  });
});