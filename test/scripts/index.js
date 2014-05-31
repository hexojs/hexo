var file = require('../../lib/util/file2'),
  pathFn = require('path');

describe('Hexo test', function(){
  require('./init');
  require('./util');
  require('./i18n');
  require('./filter');
  require('./helper');
  require('./tag');

  after(function(done){
    file.rmdir(pathFn.join(__dirname, '../blog'), done);
  });
});