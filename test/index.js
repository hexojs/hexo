var file = require('../lib/util/file2'),
  fs = require('graceful-fs'),
  pathFn = require('path');

describe('Hexo test', function(){
  require('./scripts/init');
  require('./scripts/util');
  require('./scripts/i18n');
  require('./scripts/filter');
  require('./scripts/helper');
  require('./scripts/tag');

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