define([
  'lib/angular',
  'module',
  'controllers',
  'filters',
  'services',
  'directives',
  'plugins/angular-ui-router',
  'plugins/angular-ui-bootstrap'
], function(angular, module){
  var config = module.config(),
    base = config.base;

  var app = angular.module('hexo', [
    'ui.state',
    'ui.bootstrap',
    'hexo.controllers',
    'hexo.filters',
    'hexo.services',
    'hexo.directives'
  ]);

  app.constant('version', config.version)
    .constant('rootUrl', config.root)
    .constant('baseUrl', base)
    .constant('apiBaseUrl', base + 'api/')
    .constant('templateBaseUrl', base + 'templates/');

  return app;
});