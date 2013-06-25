define([
  'lib/angular',
  'module',
  'controllers',
  'filters',
  'services',
  //'plugins/restangular',
  'plugins/angular-ui-router',
  'plugins/angular-ui-bootstrap',
  'plugins/angular-ui-ace'
], function(angular, module){
  var config = module.config(),
    base = config.base;

  var app = angular.module('hexo', [
    'ui.state',
    //'restangular',
    'ui.bootstrap',
    'ui.ace',
    'hexo.controllers',
    'hexo.filters',
    'hexo.services'
  ]);

  app.constant('version', config.version)
    .constant('baseUrl', base)
    .constant('apiBaseUrl', base + 'api/')
    .constant('templateBaseUrl', base + 'templates/');

  return app;
});