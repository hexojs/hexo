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
        abstract: true,
        templateUrl: templateBaseUrl + 'files/index',
        controller: 'FileIndexCtrl'
      })
      .state('files.list', {
        url: '/list/:path',
        views: {
          '': {
            templateUrl: templateBaseUrl + 'files/list',
            controller: 'FileListCtrl'
          }
        }
      })
      .state('files.list.image', {
        url: '/image/:name',
        views: {
          image: {
            templateUrl: templateBaseUrl + 'files/image',
            controller: 'FileImageCtrl'
          }
        }
      })
      .state('files.show', {
        url: '/show/:path',
        views: {
          '': {
            templateUrl: templateBaseUrl + 'files/show',
            controller: 'FileShowCtrl'
          }
        }
      });

    $urlRouterProvider.otherwise(baseUrl);
    $locationProvider.html5Mode(true);
  }]);
});