define(function(require, exports, module){
  var app = require('app');

  app.config(['$stateProvider', '$locationProvider', '$urlRouterProvider', 'baseUrl', 'templateBaseUrl',
    function($stateProvider, $locationProvider, $urlRouterProvider, baseUrl, templateBaseUrl){

    $stateProvider
      .state('home', {
        url: baseUrl,
        templateUrl: templateBaseUrl + 'home/index',
        controller: 'HomeCtrl'
      })
      .state('posts', {
        url: baseUrl + 'posts',
        templateUrl: templateBaseUrl + 'posts/index',
        controller: 'PostIndexCtrl'
      })
      .state('posts.edit', {
        url: '/{id:[0-9]{1,}}/edit',
        views: {
          '': {
            templateUrl: templateBaseUrl + 'posts/edit',
            controller: 'PostEditCtrl'
          }
        }
      })
      .state('files', {
        url: baseUrl + 'files',
        templateUrl: templateBaseUrl + 'files/index',
        controller: 'FileIndexCtrl'
      })
      .state('files.list', {
        url: '/list/:path',
        templateUrl: templateBaseUrl + 'files/index',
        controller: 'FileIndexCtrl'
      })
      .state('files.show', {
        url: '/show/:path',
        templateUrl: templateBaseUrl + 'files/show',
        controller: 'FileShowCtrl'
      });

    $urlRouterProvider.otherwise(baseUrl);
    $locationProvider.html5Mode(true);
  }]);
});