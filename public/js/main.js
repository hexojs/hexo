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
    'lib/lodash': [
      'lib/lodash.min'
    ],
    'codemirror/addon': [
      'lib/codemirror/addon'
    ],
    'codemirror/mode': [
      'lib/codemirror/mode'
    ],
    'lib/codemirror': [
      'lib/codemirror/lib/codemirror'
    ],
    'plugins/angular-ui': [
      'plugins/angular-ui.min'
    ],
    'plugins/angular-ui-router': [
      'plugins/angular-ui-router.min'
    ],
    'plugins/angular-ui-bootstrap': [
      'plugins/ui-bootstrap-tpls-0.4.0.min'
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
    'codemirror/addon': {
      deps: ['lib/codemirror']
    },
    'codemirror/mode': {
      deps: ['lib/codemirror']
    },
    'lib/codemirror': {
      exports: 'CodeMirror'
    },
    'plugins/angular-ui-router': {
      deps: ['lib/angular']
    },
    'plugins/angular-ui-bootstrap': {
      deps: ['lib/angular']
    },
    'plugins/restangular': {
      deps: ['lib/angular', 'lib/lodash']
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