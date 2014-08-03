var async = require('async'),
  fs = require('graceful-fs'),
  pathFn = require('path');

describe('Scaffold', function(){
  var fixture = '';

  before(function(done){
    fs.readFile(pathFn.join(__dirname, 'fixture.md'), 'utf8', function(err, content){
      if (err) return done(err);

      fixture = content;
      done();
    });
  });

  it('get', function(done){
    hexo.scaffold.get('post', function(err, content){
      if (err) return done(err);

      content.replace(/\n+$/, '').should.eql([
        'title: {{ title }}',
        'date: {{ date }}',
        'tags:',
        '---'
      ].join('\n'));
      done();
    });
  });

  it('get the default layout', function(){
    hexo.scaffold.get('blah', function(err, content){
      if (err) return done(err);

      content.replace(/\n+$/, '').should.eql([
        'layout: {{ layout }}',
        'title: {{ title }}',
        'date: {{ date }}',
        'tags:',
        '---'
      ].join('\n'));
      done();
    });
  });

  it('set', function(done){
    async.series([
      function(next){
        hexo.scaffold.set('foo', fixture, next);
      },
      function(next){
        hexo.scaffold.get('foo', function(err, content){
          if (err) return next(err);

          content.should.eql(fixture);
          next();
        });
      },
      function(next){
        fs.readFile(pathFn.join(hexo.scaffold_dir, 'foo.md'), 'utf8', function(err, content){
          if (err) return next(err);

          content.should.eql(fixture);
          next();
        });
      }
    ], done);
  });

  it('remove', function(done){
    async.series([
      function(next){
        hexo.scaffold.remove('foo', next);
      },
      function(next){
        fs.exists(pathFn.join(hexo.scaffold_dir, 'foo.md'), function(exist){
          exist.should.be.false;
          next();
        });
      }
    ], done);
  });
});