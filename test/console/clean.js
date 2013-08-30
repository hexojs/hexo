var fs = require('graceful-fs'),
  async = require('async'),
  path = require('path');

describe('clean', function(){
  var dbPath = path.join(__dirname, '../blog/db.json'),
    publicDir = hexo.public_dir;

  before(function(done){
    async.parallel([
      function(next){
        fs.writeFile(dbPath, '', next);
      },
      function(next){
        fs.mkdir(publicDir, next);
      }
    ], done);
  });

  it('clean', function(done){
    hexo.call('clean', function(){
      async.every([dbPath, publicDir], fs.exists, function(result){
        result.should.be.false;
        done();
      });
    });
  });
});