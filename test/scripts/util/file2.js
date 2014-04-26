var path = require('path'),
  fs = require('graceful-fs'),
  async = require('async');

describe('Util - file2', function(){
  var file = require('../../../lib/util/file2');

  var uid = function(length){
    var txt = '0123456789abcdefghijklmnopqrstuvwxyz',
      total = txt.length,
      result = '';

    for (var i = 0; i < length; i++){
      result += txt[parseInt(Math.random() * total)];
    }

    return result;
  };

  it('mkdirs', function(done){
    var dest = path.join(__dirname, uid(12), uid(12));

    async.series([
      function(next){
        file.mkdirs(dest, next);
      },
      function(next){
        fs.exists(dest, function(exist){
          exist.should.be.true;
          next();
        });
      },
      function(next){
        fs.rmdir(dest, next);
      },
      function(next){
        fs.rmdir(path.dirname(dest), next);
      }
    ], done);
  });

  describe('writeFile', function(){
    it('normal', function(done){
      var dest = path.join(__dirname, uid(12), uid(12)),
        content = uid(48);

      async.series([
        function(next){
          file.writeFile(dest, content, next);
        },
        function(next){
          fs.readFile(dest, 'utf8', function(err, result){
            if (err) throw err;

            result.should.eql(content);
            next();
          });
        },
        function(next){
          fs.unlink(dest, next);
        },
        function(next){
          fs.rmdir(path.dirname(dest), next);
        }
      ], done);
    });

    it('checkParent disabled', function(done){
      var dest = path.join(__dirname, uid(12), uid(12)),
        content = uid(48);

      file.writeFile(dest, content, {checkParent: false}, function(err){
        err.code.should.eql('ENOENT');
        done();
      });
    });
  });

  describe('copyFile', function(){
    var src = path.join(__dirname, uid(12)),
      content = uid(48);

    before(function(done){
      fs.writeFile(src, content, done);
    });

    it('normal', function(done){
      var dest = path.join(__dirname, uid(12), uid(12));

      async.series([
        function(next){
          file.copyFile(src, dest, next);
        },
        function(next){
          fs.readFile(dest, 'utf8', function(err, result){
            if (err) throw err;

            result.should.eql(content);
            next();
          });
        },
        function(next){
          fs.unlink(dest, next);
        },
        function(next){
          fs.rmdir(path.dirname(dest), next);
        }
      ], done);
    });

    it('checkParent disabled', function(done){
      var dest = path.join(__dirname, uid(12), uid(12));

      file.copyFile(src, dest, {checkParent: false}, function(err){
        err.code.should.eql('ENOENT');
        done();
      });
    });

    after(function(done){
      fs.unlink(src, done);
    });
  });

  describe('copyDir', function(){
    var src = path.join(__dirname, uid(12));

    var srcFiles = [
      '.' + uid(12),
      uid(12) + '.txt',
      uid(12) + '.js'
    ];

    before(function(done){
      fs.mkdir(src, function(err){
        if (err) throw err;

        async.forEach(srcFiles, function(item, next){
          fs.writeFile(path.join(src, item), '', next);
        }, done);
      });
    });

    it('normal', function(done){
      var dest = path.join(__dirname, uid(12), uid(12));

      async.series([
        function(next){
          file.copyDir(src, dest, next);
        },
        function(next){
          async.forEach(srcFiles.slice(1), function(item, next){
            var filePath = path.join(dest, item);

            fs.exists(filePath, function(exist){
              exist.should.be.true;

              fs.unlink(filePath, next);
            });
          }, next);
        },
        function(next){
          fs.rmdir(dest, next);
        },
        function(next){
          fs.rmdir(path.dirname(dest), next);
        }
      ], done);
    });

    it('ignoreHidden disabled', function(done){
      var dest = path.join(__dirname, uid(12), uid(12));

      async.series([
        function(next){
          file.copyDir(src, dest, {ignoreHidden: false}, next);
        },
        function(next){
          async.forEach(srcFiles, function(item, next){
            var filePath = path.join(dest, item);

            fs.exists(filePath, function(exist){
              exist.should.be.true;

              fs.unlink(filePath, next);
            });
          }, next);
        },
        function(next){
          fs.rmdir(dest, next);
        },
        function(next){
          fs.rmdir(path.dirname(dest), next);
        }
      ], done);
    });

    it('ignorePattern', function(done){
      var dest = path.join(__dirname, uid(12), uid(12));

      async.series([
        function(next){
          file.copyDir(src, dest, {ignorePattern: /\.js$/}, next);
        },
        function(next){
          async.forEach(srcFiles.slice(1, 2), function(item, next){
            var filePath = path.join(dest, item);

            fs.exists(filePath, function(exist){
              exist.should.be.true;

              fs.unlink(filePath, next);
            });
          }, next);
        },
        function(next){
          fs.rmdir(dest, next);
        },
        function(next){
          fs.rmdir(path.dirname(dest), next);
        }
      ], done);
    });

    after(function(done){
      async.forEach(srcFiles, function(item, next){
        fs.unlink(path.join(src, item), next);
      }, function(err){
        if (err) throw err;

        fs.rmdir(src, done);
      });
    });
  });

  describe('list', function(){
    var src = path.join(__dirname, uid(12));

    var srcFiles = [
      uid(12) + '.txt',
      path.join('.hiddendir', uid(12) + '.txt'),
      path.join('.hiddendir', uid(12) + '.js'),
      path.join('.hiddendir', 'hiddenchild', uid(12)),
      path.join('dir', uid(12) + '.txt'),
      path.join('dir', uid(12) + '.js'),
      path.join('dir', 'childdir', uid(12) + '.txt'),
      path.join('dir', 'childdir', uid(12) + '.js'),
      '.hiddenfile'
    ];

    before(function(done){
      async.series([
        function(next){
          fs.mkdir(src, next);
        },
        function(next){
          async.forEach(srcFiles, function(item, next){
            file.writeFile(path.join(src, item), '', next);
          }, next);
        }
      ], done);
    });

    var defer = function(arr, callback){
      return function(err, files){
        srcFiles.forEach(function(item, i){
          if (arr.indexOf(i) > -1){
            files.should.include(item);
          } else {
            files.should.not.include(item);
          }
        });

        callback();
      }
    };

    it('normal', function(done){
      file.list(src, defer([0, 4, 5, 6, 7], done));
    });

    it('ignoreHidden disabled', function(done){
      file.list(src, {ignoreHidden: false}, defer([0, 1, 2, 3, 4, 5, 6, 7, 8], done));
    });

    it('ignorePattern', function(done){
      file.list(src, {ignorePattern: /\.js$/}, defer([0, 4, 6], done));
    });

    after(function(done){
      file.rmdir(src, done);
    });
  });

  describe('readFile', function(){
    var src = path.join(__dirname, uid(12)),
      content = uid(48);

    before(function(done){
      fs.writeFile(src, content, done);
    });

    it('normal', function(done){
      file.readFile(src, function(err, result){
        if (err) throw err;

        result.should.eql(content);
        done();
      });
    });

    it('buffer', function(done){
      file.readFile(src, {encoding: null}, function(err, result){
        if (err) throw err;

        result.should.be.instanceof(Buffer);
        result.toString('utf8').should.eql(content);
        done();
      });
    });

    after(function(done){
      fs.unlink(src, done);
    });
  });

  describe('readFileSync', function(){
    var src = path.join(__dirname, uid(12)),
      content = uid(48);

    before(function(done){
      fs.writeFile(src, content, done);
    });

    it('normal', function(done){
      var result = file.readFileSync(src);

      result.should.eql(content);
      done();
    });

    it('buffer', function(done){
      var result = file.readFileSync(src, {encoding: null});

      result.should.be.instanceof(Buffer);
      result.toString('utf8').should.eql(content);

      done();
    });

    after(function(done){
      fs.unlink(src, done);
    });
  });

  describe('emptyDir', function(){
    var src = path.join(__dirname, uid(12));

    var srcFiles = [
      uid(12) + '.txt',
      path.join('.hiddendir', uid(12) + '.txt'),
      path.join('.hiddendir', uid(12) + '.js'),
      path.join('.hiddendir', 'hiddenchild', uid(12)),
      path.join('dir', uid(12) + '.txt'),
      path.join('dir', uid(12) + '.js'),
      path.join('dir', 'childdir', uid(12) + '.txt'),
      path.join('dir', 'childdir', uid(12) + '.js'),
      '.hiddenfile'
    ];

    before(function(done){
      fs.mkdir(src, done);
    });

    beforeEach(function(done){
      async.forEach(srcFiles, function(item, next){
        file.writeFile(path.join(src, item), '', next);
      }, done);
    });

    var defer = function(arr, callback){
      return function(err, removed){
        if (err) throw err;

        srcFiles.forEach(function(item, i){
          if (arr.indexOf(i) > -1){
            removed.should.include(item);
          } else {
            removed.should.not.include(item);
          }
        });

        var i = 0;

        async.forEachSeries(srcFiles, function(item, next){
          fs.exists(path.join(src, item), function(exist){
            if (arr.indexOf(i) > -1){
              exist.should.be.false;
            } else {
              exist.should.be.true;
            }

            i++;
            next();
          });
        }, callback);
      }
    };

    it('normal', function(done){
      file.emptyDir(src, defer([0, 4, 5, 6, 7], done));
    });

    it('ignoreHidden disabled', function(done){
      file.emptyDir(src, {ignoreHidden: false}, defer([0, 1, 2, 3, 4, 5, 6, 7, 8], done));
    });

    it('ignorePattern', function(done){
      file.emptyDir(src, {ignorePattern: /\.js$/}, defer([0, 4, 6], done));
    });

    it('exclude', function(done){
      var options = {
        exclude: [srcFiles[4], srcFiles[6]]
      };

      file.emptyDir(src, options, defer([0, 5, 7], done));
    });

    after(function(done){
      file.rmdir(src, done);
    });
  });

  describe('rmdir', function(){
    var src = path.join(__dirname, uid(12));

    var srcFiles = [
      uid(12),
      uid(12),
      path.join('dir', uid(12)),
      path.join('dir', uid(12)),
      path.join('dir', 'chlid', uid(12))
    ];

    beforeEach(function(done){
      async.series([
        function(next){
          fs.mkdir(src, next);
        },
        function(next){
          async.forEach(srcFiles, function(item, next){
            file.writeFile(path.join(src, item), '', next);
          }, next);
        }
      ], done);
    });

    it('normal', function(done){
      file.rmdir(src, function(err){
        if (err) throw err;

        fs.exists(src, function(exist){
          exist.should.be.false;
          done();
        });
      });
    });
  });
});