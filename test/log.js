var term = require('term'),
  moment = require('moment'),
  path = require('path'),
  should = require('should'),
  fs = require('graceful-fs'),
  Log = require('../lib/log');

describe('Log', function(){
  var log = new Log();

  it('constructor', function(){
    log.store.should.be.eql([]);

    log.levels.should.be.eql({
      error: 1,
      warn: 3,
      info: 5,
      debug: 7
    });

    log.color.should.be.eql({
      error: 'red',
      warn: 'yellow',
      info: 'green',
      debug: 'blackBright'
    });

    log.alias.should.be.eql({
      e: 'error',
      err: 'error',
      w: 'warn',
      i: 'info',
      d: 'debug'
    });

    log.hide.should.be.eql(7);
    log.default.should.be.eql('info');
    log.format.should.be.eql('[:level] :date[HH:mm:ss] :message');
  });

  it('setLevel()', function(){
    log.setLevel('test', 9);

    log.levels.test.should.be.eql(9);
    log.color.test.should.be.eql('white');

    log.setLevel('foo', 10, 'cyan');

    log.levels.foo.should.be.eql(10);
    log.color.foo.should.be.eql('cyan');
  });

  it('setColor()', function(){
    log.setColor('test', 'blue');

    log.color.test.should.be.eql('blue');
  });

  it('setAlias()', function(){
    log.setAlias('t', 'test');

    log.alias.t.should.be.eql('test');
  });

  it('setHide()', function(){
    log.setHide(5);

    log.hide.should.be.eql(5);
  });

  it('setDefault()', function(){
    log.setDefault('debug');

    log.default.should.be.eql('debug');
  });

  it('setFormat()', function(){
    log.setFormat(':level :date[YYYY-MM-DD HH:mm:ss] :message');

    log.format.should.be.eql(':level :date[YYYY-MM-DD HH:mm:ss] :message');
  });

  it('log() - default', function(){
    log.log('test %d %s', 123, 'string');

    log.store[0].should.include({level: log.default, message: 'test 123 string'});
  });

  it('log() - level specified', function(){
    log.log('info', 'test %d %s', 123, 'string');

    log.store[1].should.include({level: 'info', message: 'test 123 string'});
  });

  it('_toString()', function(){
    log.store.forEach(function(item){
      log._toString(item).should.be.eql(item.level + ' ' + moment(item.date).format('YYYY-MM-DD HH:mm:ss') + ' ' + item.message);
      log._toString.call({format: ':date'}, item).should.be.eql(item.date.toISOString());
    });
  });

  it('_trim()', function(){
    log._trim('123'.red).should.be.eql('123');
  });

  it('toJSON()', function(){
    var json = log.toJSON(),
      store = log.store;

    for (var i = 0, len = json.length; i < len; i++){
      json[i].should.be.eql({
        level: store[i].level,
        message: log._trim(store[i].message),
        date: store[i].date
      });
    }
  });

  it('save()', function(done){
    var dest = path.join(__dirname, 'test.log'),
      json = log.toJSON();

    log.save(dest, function(err){
      should.not.exist(err);

      log.store.should.be.eql([]);

      fs.readFile(dest, 'utf8', function(err, content){
        should.not.exist(err);

        var str = '';

        json.forEach(function(item){
          str += '[' + item.level.toUpperCase() + '] ' + item.date.toISOString() + '\n' + item.message + '\n\n';
        });

        content.should.be.eql(str);

        done();
      });
    });
  });

  after(function(){
    fs.unlink(path.join(__dirname, 'test.log'));
  });
});