var path = require('path'),
  fs = require('graceful-fs'),
  async = require('async'),
  should = require('should'),
  yaml = require('yamljs');

describe('i18n', function(){
  var I18n = require('../lib/i18n'),
    i18n = new I18n(),
    langDir = path.join(__dirname, 'languages'),
    lang = {};

  it('load language files', function(done){
    fs.readdir(langDir, function(err, files){
      if (err) throw err;

      async.forEach(files, function(item, next){
        fs.readFile(path.join(langDir, item), 'utf8', function(err, content){
          if (err) throw err;

          lang[path.basename(item, path.extname(item))] = yaml.parse(content);
          next();
        });
      }, done);
    });
  });

  it('load()', function(done){
    i18n.load(langDir, function(err){
      should.not.exist(err);

      var store = i18n.store;

      for (var i in store){
        store[i].should.eql(lang[i]);
      }

      done();
    });
  });

  it('_getCode()', function(){
    i18n._getCode('zh-tw').should.eql('zh-tw');
    i18n._getCode('zh').should.eql('zh-tw');
    i18n._getCode('zh-hk').should.eql('zh-tw');
    i18n._getCode('en').should.eql('default');
  });

  it('get()', function(){
    var get = i18n.get();

    get('index.title').should.eql(lang.default.index.title);
    get('index.add').should.eql(lang.default.index.add);

    var tw = i18n.get('zh-tw');
    tw('index.title').should.eql(lang['zh-tw'].index.title);
    tw('index.add').should.eql(lang['zh-tw'].index.add);
  });

  it('plural()', function(){
    var plural = i18n.plural();

    plural('index.video.singular', 'index.video.plural', 0).should.eql('0 videos');
    plural('index.video.singular', 'index.video.plural', 1).should.eql('1 video');
    plural('index.video.singular', 'index.video.plural', 2).should.eql('2 videos');
  });
});