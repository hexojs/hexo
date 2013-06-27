define(function(require, exports, module){
  var angular = require('lib/angular'),
    CodeMirror = require('lib/codemirror');

  angular.module('hexo.directives', [])
    .directive('codemirror', ['$timeout', function($timeout){
      return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, elm, attrs, ngModel){
          var options = scope.$eval(attrs.codemirror) || {},
            editor = CodeMirror.fromTextArea(elm[0], options);

          ngModel.$render = function(){
            editor.setValue(ngModel.$viewValue || '');
          };

          editor.on('change', function(){
            ngModel.$setViewValue(editor.getValue());
          });

          if (attrs.instance){
            scope[attrs.instance] = editor;
          }
        }
      }
    }]);
});