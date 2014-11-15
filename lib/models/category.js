var Schema = require('warehouse').Schema,
  util = require('../util'),
  escape = util.escape;

var Category = module.exports = new Schema({
  name: {type: String, required: true},
  parent: {type: Schema.Types.CUID, ref: 'Category'},
  posts: [{type: Schema.Types.CUID, ref: 'Post'}]
});

Category.virtual('slug').get(function(){
  var map = hexo.config.category_map,
    name = this.name,
    str = '';

  if (this.parent){
    var parent = hexo.model('Category').findById(this.parent);
    str += parent.slug + '/';
  }

  name = map && map.hasOwnProperty(name) ? map[name] : name;
  str += escape.filename(name, hexo.config.filename_case);

  return str;
});

Category.virtual('path').get(function(){
  var catDir = hexo.config.category_dir;
  if (catDir[catDir.length - 1] !== '/') catDir += '/';

  return catDir + this.slug + '/';
});

Category.virtual('permalink').get(function(){
  return hexo.config.url + '/' + this.path;
});

Category.virtual('length').get(function(){
  return this.posts.length;
});