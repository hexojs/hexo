var Schema = require('warehouse').Schema;
var util = require('../util');
var escape = util.escape;

var Tag = module.exports = new Schema({
  name: {type: String, required: true},
  posts: [{type: Schema.Types.CUID, ref: 'Post'}]
});

Tag.virtual('slug').get(function(){
  var map = hexo.config.tag_map;
  var name = this.name;

  name = map && map.hasOwnProperty(name) ? map[name] : name;
  return escape.filename(name, hexo.config.filename_case);
});

Tag.virtual('path').get(function(){
  var tagDir = hexo.config.tag_dir;
  if (tagDir[tagDir.length - 1] !== '/') tagDir += '/';

  return tagDir + this.slug + '/';
});

Tag.virtual('permalink').get(function(){
  return hexo.config.url + '/' + this.path;
});

Tag.virtual('length').get(function(){
  return this.posts.length;
});