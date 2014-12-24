module.exports = function(path){
  return '<link rel="shortcut icon" href="' + this.url_for(path) + '">';
};