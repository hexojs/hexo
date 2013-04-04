var extend = require('../../extend'),
  config = hexo.config,
  archiveDir = config.archive_dir,
  categoryDir = config.category_dir,
  tagDir = config.tag_dir,
  pageDir = config.pagination_dir,
  permalink = config.permalink;

var regexPostStr = permalink
  .replace(/\//g, '\\/')
  .replace(':id', '\\d+')
  .replace(':category', '(\\w+\\/?/)+')
  .replace(':year', '\\d{4}')
  .replace(/:(month|day)/g, '\\d{2}')
  .replace(':title', '[^\\/]+');

var regex = {
  home: new RegExp('^' + pageDir + '\\/\\d+\\/'),
  post: new RegExp('^' + regexPostStr),
  archive: new RegExp('^' + archiveDir + '\\/'),
  year: new RegExp('^' + archiveDir + '\\/\\d{4}\\/'),
  month: new RegExp('^' + archiveDir + '\\/\\d{4}\\/\\d{2}\\/'),
  category: new RegExp('^' + categoryDir + '\\/'),
  tag: new RegExp('^' + tagDir + '\\/')
};

extend.helper.register('is_current', function(path){
  return this.path === path;
});

extend.helper.register('is_home', function(){
  return this.path === '' || regex.home.test(this.path);
});

extend.helper.register('is_post', function(){
  return regex.post.test(this.path);
});

extend.helper.register('is_archive', function(){
  return regex.archive.test(this.path);
});

extend.helper.register('is_year', function(){
  return regex.year.test(this.path);
});

extend.helper.register('is_month', function(){
  return regex.month.test(this.path);
});

extend.helper.register('is_category', function(){
  return regex.category.test(this.path);
});

extend.helper.register('is_tag', function(){
  return regex.tag.test(this.path);
});