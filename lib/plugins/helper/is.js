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

extend.helper.register('is_home', function(path){
  return path === '' || regex.home.test(path);
});

extend.helper.register('is_post', function(path){
  console.log(regex.post);
  return regex.post.test(path);
});

extend.helper.register('is_archive', function(path){
  return regex.archive.test(path);
});

extend.helper.register('is_year', function(path){
  return regex.year.test(path);
});

extend.helper.register('is_month', function(path){
  return regex.month.test(path);
});

extend.helper.register('is_category', function(path){
  return regex.category.test(path);
});

extend.helper.register('is_tag', function(path){
  return regex.tag.test(path);
});