(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.component = factory());
}(this, (function () { 'use strict';

    var checkForAlpine = function checkForAlpine() {
      if (!window.Alpine) {
        throw new Error('[Magic Helpers] Alpine is required for the magic helpers to function correctly.');
      }
    };
    var saferEval = function saferEval(expression, dataContext, additionalHelperVariables) {
      if (additionalHelperVariables === void 0) {
        additionalHelperVariables = {};
      }

      if (typeof expression === 'function') {
        return expression.call(dataContext);
      }

      return new Function(['$data'].concat(Object.keys(additionalHelperVariables)), "var __alpine_result; with($data) { __alpine_result = " + expression + " }; return __alpine_result").apply(void 0, [dataContext].concat(Object.values(additionalHelperVariables)));
    };

    var AlpineComponentMagicMethod = {
      start: function start() {
        checkForAlpine();
        Alpine.addMagicProperty('parent', function ($el) {
          if (typeof $el.$parent !== 'undefined') return $el.$parent;
          var parentComponent = $el.parentNode.closest('[x-data]');
          if (!parentComponent) throw 'Parent component not found'; // Add this to trigger mutations on update

          parentComponent.setAttribute('x-bind:data-last-refresh', 'Date.now()');
          var data;

          if (parentComponent.__x) {
            data = parentComponent.__x.getUnobservedData();
          } else {
            // Component isn't ready yet so lets try to get its initial state
            data = saferEval(parentComponent.getAttribute('x-data'), parentComponent);
          }

          $el.$parent = allowTwoWayCommunication(data, parentComponent);
          var parentObserver = new MutationObserver(function (mutations) {
            for (var i = 0; i < mutations.length; i++) {
              var mutatedComponent = mutations[i].target.closest('[x-data]');
              if (mutatedComponent && !mutatedComponent.isSameNode(parentComponent)) continue;
              $el.$parent = allowTwoWayCommunication(parentComponent.__x.getUnobservedData(), parentComponent);

              $el.__x.updateElements($el);

              return;
            }
          });
          parentObserver.observe(parentComponent, {
            attributes: true,
            childList: true,
            characterData: true,
            subtree: true
          });
          return $el.$parent;
        });
        Alpine.addMagicProperty('component', function ($el) {
          return function (componentName) {
            var _this = this;

            if (typeof this[componentName] !== 'undefined') return this[componentName];
            var componentBeingObserved = document.querySelector("[x-data][x-id=\"" + componentName + "\"], [x-data]#" + componentName);
            if (!componentBeingObserved) throw 'Component not found'; // Add this to trigger mutations on update

            componentBeingObserved.setAttribute('x-bind:data-last-refresh', 'Date.now()'); // Set initial state

            var data;

            if (componentBeingObserved.__x) {
              data = componentBeingObserved.__x.getUnobservedData();
            } else {
              // Component isn't ready yet so lets try to get its initial state
              data = saferEval(componentBeingObserved.getAttribute('x-data'), componentBeingObserved);
            }

            this[componentName] = allowTwoWayCommunication(data, componentBeingObserved);
            var observer = new MutationObserver(function (mutations) {
              for (var i = 0; i < mutations.length; i++) {
                var closestParentComponent = mutations[i].target.closest('[x-data]');
                if (closestParentComponent && closestParentComponent.isSameNode(_this.$el)) continue;
                _this[componentName] = allowTwoWayCommunication(componentBeingObserved.__x.getUnobservedData(), componentBeingObserved);
                return;
              }
            });
            observer.observe(componentBeingObserved, {
              attributes: true,
              childList: true,
              characterData: true,
              subtree: true
            });
            return this[componentName];
          };
        });
      }
    };

    var allowTwoWayCommunication = function allowTwoWayCommunication(data, observedComponent) {
      var handler = function handler(scope) {
        if (scope === void 0) {
          scope = null;
        }

        return {
          get: function get(target, key) {
            if (typeof target[key] != null && typeof target[key] === 'object') {
              var path = scope ? scope + "." + key : key;
              return new Proxy(target[key], handler(path));
            }

            return target[key];
          },
          set: function set(target, key, value) {
            if (!observedComponent.__x) {
              throw 'Error communicating with observed component';
            }

            var path = scope ? scope + "." + key : key;
            objectSetDeep(observedComponent.__x.$data, path, value);
            return true;
          }
        };
      };

      return new Proxy(data, handler());
    }; // Borrowed from https://stackoverflow.com/a/54733755/1437789


    var objectSetDeep = function objectSetDeep(object, path, value) {
      path = path.toString().match(/[^.[\]]+/g) || [];
      path.slice(0, -1).reduce(function (a, currentKey, index) {
        return (// Iterate all of them except the last one
          Object(a[currentKey]) === a[currentKey] // Does the key exist and is its value an object?
          // Yes: then follow that path
          ? a[currentKey] // No: create the key. Is the next key a potential array-index?
          : a[currentKey] = Math.abs(path[index + 1]) >> 0 === +path[index + 1] ? [] // Yes: assign a new array object
          : {}
        );
      }, // No: assign a new plain object
      object)[path[path.length - 1]] = value; // Finally assign the value to the last key

      return object;
    };

    var alpine = window.deferLoadingAlpine || function (alpine) {
      return alpine();
    };

    window.deferLoadingAlpine = function (callback) {
      alpine(callback);
      AlpineComponentMagicMethod.start();
    };

    return AlpineComponentMagicMethod;

})));
