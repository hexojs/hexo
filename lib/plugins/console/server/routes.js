module.exports = function(app){
  app.get('404', 'error#404');
  app.get('500', 'error#500');
};