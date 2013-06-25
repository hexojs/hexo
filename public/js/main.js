require.config({
  paths: {
    'lib/jquery': [
      '//ajax.googleapis.com/ajax/libs/jquery/2.0.2/jquery.min',
      'lib/jquery.min'
    ],
    'lib/angular': [
      '//ajax.googleapis.com/ajax/libs/angularjs/1.0.7/angular.min',
      'lib/angular.min'
    ],
    'lib/moment': [
      'lib/moment/moment.min'
    ],
    'plugins/angular-ui-router': [
      'plugins/angular-ui-router.min'
    ],
    'plugins/angular-ui-bootstrap': [
      'plugins/ui-bootstrap-tpls-0.4.0.min'
    ],
    'plugins/angular-ui-ace': [
      'plugins/angular-ui-ace'
    ],
    'plugins/restangular': [
      'plugins/restangular.min'
    ]
  },
  shim: {
    'lib/angular': {
      exports: 'angular'
    },
    'lib/jquery': {
      exports: 'jQuery'
    },
    'plugins/angular-ui-router': {
      deps: ['lib/angular']
    },
    'plugins/angular-ui-bootstrap': {
      deps: ['lib/angular']
    },
    'plugins/angular-ui-ace': {
      deps: ['lib/angular', 'lib/ace/ace']
    },
    'plugins/restangular': {
      deps: ['lib/angular']
    }
  }
});

define([
  'lib/angular',
  'app',
  'routes'
], function(angular, app){
  angular.bootstrap(document, ['hexo']);
});