var file = require('../../lib/util/file2'),
  fs = require('graceful-fs'),
  pathFn = require('path');

describe('Hexo test', function(){
  require('./init');
  require('./util');
  require('./i18n');
  require('./filter');
  require('./helper');
  require('./tag');

  after(function(done){
    var blogDir = pathFn.join(pathFn.dirname(__dirname), 'blog');

    fs.exists(blogDir, function(exist){
      if (exist){
        file.rmdir(blogDir, done);
      } else {
        done();
      }
    });
  });
});