/**
 * Binds a ACE Ediitor widget
 */

//TODO handle Could not load worker ace.js:1
//DOMException {message: "SECURITY_ERR: DOM Exception 18", name: "SECURITY_ERR", code: 18, stack: "Error: An attempt was made to break through the se…cloudfront.net/src-min-noconflict/ace.js:1:76296)", INDEX_SIZE_ERR: 1…}

angular.module('ui.ace', [])
  .constant('uiAceConfig', {})
  .directive('uiAce', ['uiAceConfig', function (uiAceConfig) {
    if (angular.isUndefined(window.ace)) {
      throw new Error('ui-ace need ace to work... (o rly?)');
    }
    return {
      restrict: 'EA',
      require: '?ngModel',
      link: function (scope, elm, attrs, ngModel) {
        var options, opts, acee, session, onChange;

        options = uiAceConfig.ace || {};
        opts = angular.extend({}, options, scope.$eval(attrs.uiAce));

        /**
         * Fix of http://ace.ajax.org/#nav=embedding
         * to have ace as a block
         * Example :
         *  .ace_editor_wrapper { position : relative; height: 200px}
         */
        elm.wrap('<div class="ace_editor_wrapper" />');

        acee = window.ace.edit(elm[0]);
        session = acee.getSession();

        onChange = function (callback) {
          return function (e) {
            var newValue = session.getValue();
            if (newValue !== scope.$eval(attrs.value) && !scope.$$phase) {
              if (angular.isDefined(ngModel)) {
                scope.$apply(function () {
                  ngModel.$setViewValue(newValue);
                });
              }

              /**
               * Call the user onChange function.
               */
              if (angular.isDefined(callback)) {
                scope.$apply(function () {
                  if (angular.isFunction(callback)) {
                    callback(e, acee);
                  }
                  else {
                    throw new Error('ui-ace use a function as callback.');
                  }
                });
              }
            }
          };
        };


        // Boolean options
        if (angular.isDefined(opts.showGutter)) {
          acee.renderer.setShowGutter(opts.showGutter);
        }
        if (angular.isDefined(opts.useWrapMode)) {
          session.setUseWrapMode(opts.useWrapMode);
        }

        // Basic options
        if (angular.isString(opts.theme)) {
          acee.setTheme("ace/theme/" + opts.theme);
        }
        if (angular.isString(opts.mode)) {
          session.setMode("ace/mode/" + opts.mode);
        }


        // Value Blind
        if (angular.isDefined(ngModel)) {
          ngModel.$formatters.push(function (value) {
            if (angular.isUndefined(value) || value === null) {
              return '';
            }
            else if (angular.isObject(value) || angular.isArray(value)) {
              throw new Error('ui-ace cannot use an object or an array as a model');
            }
            return value;
          });

          ngModel.$render = function () {
            session.setValue(ngModel.$viewValue);
          };
        }

        // EVENTS
        session.on('change', onChange(opts.onChange));

        // Direct instance access
        if (attrs.scopeInstance && "" !== attrs.scopeInstance) {
          scope[attrs.scopeInstance] = acee;
        }

      }
    };
  }]);