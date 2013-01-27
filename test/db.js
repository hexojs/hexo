var Database = require('../lib/db'),
  db = new Database(),
  Schema = db.Schema;

describe('Database', function(){
  var db = new Database(),
    Schema = db.Schema;

  var schemaPosts = new Schema({
    title: String,
    layout: {type: String, default: 'post'},
    date: Date,
    comments: Boolean,
    tags: [new Schema.Types.Reference('tags')]
  });

  schemaPosts.virtual('caps').get(function(){
    return this.title.toUpperCase();
  });

  var posts = db.collection('posts', schemaPosts);

  var tags = db.collection('tags', new Schema({
    name: String,
    stat: {
      open: Boolean,
      order: Number
    }
  }));

  describe('Collection', function(){
    describe('#insert()', function(){
      it('one item', function(done){
        posts.insert({title: 'Apple', comments: false}, function(item){
          item.title.should.equal('Apple');
          item.layout.should.equal('post');
          item.comments.should.be.not.true;
          item.tags.should.be.an.instanceOf(Array);
          item.caps.should.equal('APPLE');
          done();
        });
      });

      it('multiple items', function(done){
        posts.insert([{title: 'Banana'}, {title: 'Cat', layout: 'page'}], function(item){
          item.should.be.an.instanceOf(Array);

          item[0].title.should.equal('Banana');
          item[0].layout.should.equal('post');
          item[0].comments.should.be.true;
          item[0].tags.should.be.an.instanceOf(Array);
          item[0].caps.should.equal('BANANA');

          item[1].title.should.equal('Cat');
          item[1].layout.should.equal('page');
          item[1].comments.should.be.true;
          item[1].tags.should.be.an.instanceOf(Array);
          item[1].caps.should.equal('CAT');
          done();
        });
      });
    });

    describe('#get()', function(){
      it('one item', function(){
        var item = posts.get(1);
        item.title.should.equal('Apple');
        item.layout.should.equal('post');
        item.comments.should.not.be.true;
        item.tags.should.be.an.instanceOf(Array);
        item.caps.should.equal('APPLE');
      });

      it('multiple items', function(){
        var item = posts.get([2, 3]);

        item.should.be.an.instanceOf(Array);

        item[0].title.should.equal('Banana');
        item[0].layout.should.equal('post');
        item[0].comments.should.be.true;
        item[0].tags.should.be.an.instanceOf(Array);
        item[0].caps.should.equal('BANANA');

        item[1].title.should.equal('Cat');
        item[1].layout.should.equal('page');
        item[1].comments.should.be.true;
        item[1].tags.should.be.an.instanceOf(Array);
        item[1].caps.should.equal('CAT');
      });
    });

    describe('#each()', function(){
      it('should iterates all items in the collection', function(){
        posts.each(function(item, i){
          JSON.stringify(item).should.equal(JSON.stringify(posts.get(i)));
        });
      });
    });

    describe('#first()', function(){
      it('should equals the first item', function(){
        JSON.stringify(posts.first()).should.equal(JSON.stringify(posts.get(1)));
      });
    });

    describe('#last()', function(){
      it('should equals the last item', function(){
        JSON.stringify(posts.last()).should.equal(JSON.stringify(posts.get(3)));
      });
    });

    describe('#count()', function(){
      it('should equals the number of items', function(){
        posts.count().should.equal(3);
      });
    });

    describe('#toArray()', function(){
      it('should returns an array', function(){
        var arr = posts.toArray();
        arr.should.be.an.instanceOf(Array);
        for (var i=0; i<3; i++){
          JSON.stringify(arr[i]).should.equal(JSON.stringify(posts.get(i + 1)));
        }
      });
    });

    describe('#toJSON()', function(){
      it('should returns a JSON object', function(){
        var obj = posts.toJSON();
        obj.should.be.an.instanceOf(Object);
        for (var i=1; i<4; i++){
          JSON.stringify(obj[i]).should.equal(JSON.stringify(posts.get(i)));
        }
      });
    });

    describe('#stringify()', function(){
      it('should returns a JSON string', function(){
        JSON.stringify(posts.toJSON()).should.equal(posts.stringify());
      });
    });

    describe('#update()', function(){
      it('one item', function(){
        posts.update(1, {comments: true});
        posts.get(1).comments.should.be.true;
      });

      it('multiple items', function(){
        posts.update({2: {title: 'Dog'}, 3: {comments: false}});
        posts.get(2).title.should.equal('Dog');
        posts.get(3).comments.should.be.not.true;
      });
    });

    describe('#replace()', function(){
      it('one item', function(){
        posts.replace(1, {title: 'Eye'});
        posts.get(1).title.should.equal('Eye');
      });

      it('multiple items', function(){
        posts.replace({2: {comments: false}, 3: {title: 'Free'}});
        posts.get(2).comments.should.be.not.true;
        posts.get(3).title.should.equal('Free');
      });
    });

    describe('#remove()', function(){
      it('one item', function(){
        posts.remove(1);
        (typeof posts.get(1)).should.equal('undefined');
      });

      it('multiple items', function(){
        posts.remove([2, 3]);
        (typeof posts.get(2)).should.equal('undefined');
        (typeof posts.get(3)).should.equal('undefined');
      });
    });
  });
});