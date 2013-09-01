define([
  'angular',
  'module',
  'lib/angular-ui-router/release/angular-ui-router.min',
  'services',
  'controllers',
  'filters',
  'directives'
], function(angular, module){
  var config = module.config();

  return angular.module('hexo', ['ui.router', 'hexo.services', 'hexo.controllers', 'hexo.filters', 'hexo.directives'])
    .constant('auth_token', config.auth_token);
});