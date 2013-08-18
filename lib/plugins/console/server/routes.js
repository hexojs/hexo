module.exports = function(app){
  app.get('404', 'error#404');
};