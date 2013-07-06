define(function(require, exports, module){
  var $ = require('lib/jquery');

  require(['codemirror/mode/markdown/markdown'])

  return ['$scope', '$http', '$state', '$stateParams', '$filter', '$window', 'rootUrl', 'apiBaseUrl',
    function($scope, $http, $state, $stateParams, $filter, $window, rootUrl, apiBaseUrl){

    var id = $stateParams.id;

    $scope.cmOptions = {
      lineWrapping: true,
      theme: 'neat',
      mode: 'markdown',
      extraKeys: {
        'Cmd-S': function(){
          $scope.save();
        },
        'Ctrl-S': function(){
          $scope.save();
        },
        Esc: function(){
          if ($scope.isFullscreen) $scope.fullscreen();
        }
      }
    };

    $scope.$parent.selected = id;

    $scope.save = function(){
      if ($scope.isSaving) return;

      var post = $scope.post;

      $scope.status = 'Saving...';
      $scope.isSaving = true;

      $http.put(apiBaseUrl + 'posts/' + id, {content: post.content})
        .success(function(data){
          var parent = $filter('getById')($scope.$parent.posts, id);

          parent.title = data.title;
          parent.date = data.date;

          $scope.status = 'Saved';
          $scope.post = data;
          $scope.isSaving = false;
        })
        .error(function(){
          $scope.status = 'Save failed';
          $scope.isSaving = false;
        });
    };

    $scope.modal = {
      options: {
        backdropFade: true,
        dialogFade: true
      },
      show: false,
      open: function(){
        $scope.modal.show = true;
      },
      close: function(){
        $scope.modal.show = false;
      },
      submit: function(){
        var posts = $scope.$parent.posts;

        for (var i = 0, len = posts.length; i < len; i++){
          var item = posts[i];

          if (item.id == id){
            posts.splice(i, 1);
            break;
          }
        }

        $scope.modal.close();
        $scope.$apply();
        $http.delete(apiBaseUrl + 'posts/' + id);
        $scope.$parent.selected = 0;
        $state.transitionTo('posts');
      }
    };

    var insert = function(before, after){
      var editor = $scope.editor,
        selection = editor.getSelection(),
        cursor = editor.getCursor();

      editor.replaceSelection(before + selection + after);
    };

    $scope.bold = function(){
      insert('**', '**');
    };

    $scope.italic = function(){
      insert('*', '*');
    };

    $scope.link = function(){
      insert('[', ']()');
    };

    $scope.picture = function(){
      insert('![', ']()');
    };

    $scope.preview = function(){
      $window.open(rootUrl + $scope.post.path, '_blank');
    };

    $scope.fullscreen = function(){
      if ($scope.isFullscreen){
        $('#post-edit').removeClass('fullscreen');
      } else {
        $('#post-edit').addClass('fullscreen');
      }

      $scope.isFullscreen = !$scope.isFullscreen;
    };

    $http.get(apiBaseUrl + 'posts/' + id)
      .success(function(data){
        $scope.post = data;
      })
      .error(function(){
        $state.transitionTo('posts');
      });
  }]
});