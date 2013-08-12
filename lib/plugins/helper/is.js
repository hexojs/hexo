exports.is_current = function(path){
  var newPath = path.replace(/\/index\.html$/, '/');

  return this.path.substring(0, newPath.length) === newPath;
};

exports.is_home = function(){
  var config = this.config,
    r = new RegExp('^' + config.pagination_dir + '\\/\\d+\\/');

  return this.path === '' || r.test(this.path);
};

exports.is_post = function(){
  var config = this.config;

  var rUrl = config.permalink
    .replace(/\//g, '\\/')
    .replace(':id', '\\d+')
    .replace(':category', '(\\w+\\/?)+')
    .replace(':year', '\\d{4}')
    .replace(/:(month|day)/g, '\\d{2}')
    .replace(':title', '[^\\/]+');

  var r = new RegExp('^' + rUrl);

  return r.test(this.path);
};

exports.is_archive = function(){
  var config = this.config,
    r = new RegExp('^' + config.archive_dir + '\\/');

  return r.test(this.path);
};

exports.is_year = function(){
  var config = this.config,
    r = new RegExp('^' + config.archive_dir + '\\/\\d{4}\\/');

  return r.test(this.path);
};

exports.is_month = function(){
  var config = this.config,
    r = new RegExp('^' + config.archive_dir + '\\/\\d{4}\\/\\d{2}\\/');

  return r.test(this.path);
};

exports.is_category = function(){
  var config = this.config,
    r = new RegExp('^' + config.category_dir + '\\/');

  return r.test(this.path);
};

exports.is_tag = function(){
  var config = this.config,
    r = new RegExp('^' + config.tag_dir + '\\/');

  return r.test(this.path);
};