(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, (global.AlpineMagicHelpers = global.AlpineMagicHelpers || {}, global.AlpineMagicHelpers.component = factory()));
}(this, (function () { 'use strict';

    var checkForAlpine = function checkForAlpine() {
      if (!window.Alpine) {
        throw new Error('[Magic Helpers] Alpine is required for the magic helpers to function correctly.');
      }

      if (!window.Alpine.version || !isValidVersion('2.5.0', window.Alpine.version)) {
        throw new Error('Invalid Alpine version. Please use Alpine version 2.5.0 or above');
      }
    };
    var syncWithObservedComponent = function syncWithObservedComponent(data, observedComponent, callback) {
      if (!observedComponent.getAttribute('x-bind:data-last-refresh')) {
        observedComponent.setAttribute('x-bind:data-last-refresh', 'Date.now()');
      }

      var handler = function handler(scope) {
        if (scope === void 0) {
          scope = null;
        }

        return {
          get: function get(target, key) {
            var _observedComponent$__;

            if (target[key] !== null && typeof target[key] === 'object') {
              var path = scope ? scope + "." + key : key;
              return new Proxy(target[key], handler(path));
            } // If scope is null, we are at root level so when target[key] is
            // a function, we need to make sure the context is the Alpine
            // reactive layer.
            // We bind the scope only if the observed component is ready.
            // Most of the time, the unwrapped data is enough


            if (scope === null && typeof target[key] === 'function' && observedComponent.__x) {
              return target[key].bind(observedComponent.__x.$data);
            } // If scope is null, we are at root level so when target[key] is not defined
            // we try to look for observedComponent.__x.$data[key] to check if a magic
            // helper/property exists


            if (scope === null && !target[key] && observedComponent != null && (_observedComponent$__ = observedComponent.__x) != null && _observedComponent$__.$data[key]) {
              return observedComponent.__x.$data[key];
            }

            return target[key];
          },
          set: function set(_target, key, value) {
            if (!observedComponent.__x) {
              throw new Error('Error communicating with observed component');
            }

            var path = scope ? scope + "." + key : key;
            callback.call(observedComponent, observedComponent.__x.$data, path, value);
            return true;
          }
        };
      };

      return new Proxy(data, handler());
    };
    var updateOnMutation = function updateOnMutation(componentBeingObserved, callback) {
      if (!componentBeingObserved.getAttribute('x-bind:data-last-refresh')) {
        componentBeingObserved.setAttribute('x-bind:data-last-refresh', 'Date.now()');
      }

      var observer = new MutationObserver(function (mutations) {
        for (var i = 0; i < mutations.length; i++) {
          var mutatedComponent = mutations[i].target.closest('[x-data]');
          if (mutatedComponent && !mutatedComponent.isSameNode(componentBeingObserved)) continue;
          callback();
          return;
        }
      });
      observer.observe(componentBeingObserved, {
        attributes: true,
        childList: true,
        subtree: true
      });
    }; // Borrowed from https://stackoverflow.com/a/54733755/1437789

    var objectSetDeep = function objectSetDeep(object, path, value) {
      path = path.toString().match(/[^.[\]]+/g) || []; // Iterate all of them except the last one

      path.slice(0, -1).reduce(function (a, currentKey, index) {
        // If the key does not exist or its value is not an object, create/override the key
        if (Object(a[currentKey]) !== a[currentKey]) {
          // Is the next key a potential array-index?
          a[currentKey] = Math.abs(path[index + 1]) >> 0 === +path[index + 1] ? [] // Yes: assign a new array object
          : {}; // No: assign a new plain object
        }

        return a[currentKey];
      }, object)[path[path.length - 1]] = value; // Finally assign the value to the last key

      return object;
    }; // Returns component data if Alpine has made it available, otherwise computes it with saferEval()

    var componentData = function componentData(component, properties) {
      var data = component.__x ? component.__x.getUnobservedData() : saferEval(component.getAttribute('x-data'), component);

      if (properties) {
        properties = Array.isArray(properties) ? properties : [properties];
        return properties.reduce(function (object, key) {
          object[key] = data[key];
          return object;
        }, {});
      }

      return data;
    };

    function isValidVersion(required, current) {
      var requiredArray = required.split('.');
      var currentArray = current.split('.');

      for (var i = 0; i < requiredArray.length; i++) {
        if (!currentArray[i] || parseInt(currentArray[i]) < parseInt(requiredArray[i])) {
          return false;
        }
      }

      return true;
    }

    function saferEval(expression, dataContext, additionalHelperVariables) {
      if (additionalHelperVariables === void 0) {
        additionalHelperVariables = {};
      }

      if (typeof expression === 'function') {
        return expression.call(dataContext);
      } // eslint-disable-next-line no-new-func


      return new Function(['$data'].concat(Object.keys(additionalHelperVariables)), "var __alpine_result; with($data) { __alpine_result = " + expression + " }; return __alpine_result").apply(void 0, [dataContext].concat(Object.values(additionalHelperVariables)));
    } // Returns a dummy proxy that supports multiple levels of nesting and always prints/returns an empty string.


    function getNoopProxy() {
      var handler = {
        get: function get(target, key) {
          return new Proxy(function () {
            return '';
          }, handler);
        }
      };
      return new Proxy(function () {
        return '';
      }, handler);
    } // Continuously check the observed component until it's ready.
    // It returns an object that always spits out an empty string while waiting (See getNoopProxy).

    function waitUntilReady(componentBeingObserved, component, callback) {
      if (!componentBeingObserved.__x) {
        window.requestAnimationFrame(function () {
          return component.__x.updateElements(component);
        });
        return getNoopProxy();
      }

      return callback();
    }
    function importOrderCheck() {
      // We only want to show the error once
      if (window.Alpine && !window.AlpineMagicHelpers.__fatal) {
        window.AlpineMagicHelpers.__fatal = setTimeout(function () {
          console.error('%c*** ALPINE MAGIC HELPER: Fatal Error! ***\n\n\n' + 'Alpine magic helpers need to be loaded before Alpine ' + 'to avoid errors when Alpine initialises its component. \n\n' + 'Make sure the helper script is included before Alpine in ' + 'your page when using the defer attribute', 'font-size: 14px');
        }, 200); // We set a small timeout to make sure we flush all the Alpine noise first
      }
    }

    importOrderCheck();
    var AlpineComponentMagicMethod = {
      start: function start() {
        checkForAlpine();
        Alpine.addMagicProperty('parent', function ($el) {
          if (typeof $el.$parent !== 'undefined') return $el.$parent;
          var parentComponent = $el.parentNode.closest('[x-data]');
          if (!parentComponent) throw new Error('Parent component not found'); // If the parent component is not ready, we return a dummy proxy
          // that always prints out an empty string and we check again on the next frame
          // We are de facto deferring the value for a few ms but final users
          // shouldn't notice the delay

          return waitUntilReady(parentComponent, $el, function () {
            $el.$parent = syncWithObservedComponent(componentData(parentComponent), parentComponent, objectSetDeep);
            updateOnMutation(parentComponent, function () {
              $el.$parent = syncWithObservedComponent(parentComponent.__x.getUnobservedData(), parentComponent, objectSetDeep);

              $el.__x.updateElements($el);
            });
            return $el.$parent;
          });
        });
        Alpine.addMagicProperty('component', function ($el) {
          return function (componentName) {
            var _this = this;

            if (typeof this[componentName] !== 'undefined') return this[componentName];
            var componentBeingObserved = document.querySelector("[x-data][x-id=\"" + componentName + "\"], [x-data]#" + componentName);
            if (!componentBeingObserved) throw new Error('Component not found'); // If the observed component is not ready, we return a dummy proxy
            // that always prints out an empty string and we check again on the next frame
            // We are de facto deferring the value for a few ms but final users
            // shouldn't notice the delay

            return waitUntilReady(componentBeingObserved, $el, function () {
              _this[componentName] = syncWithObservedComponent(componentData(componentBeingObserved), componentBeingObserved, objectSetDeep);
              updateOnMutation(componentBeingObserved, function () {
                _this[componentName] = syncWithObservedComponent(componentBeingObserved.__x.getUnobservedData(), componentBeingObserved, objectSetDeep);

                $el.__x.updateElements($el);
              });
              return _this[componentName];
            });
          };
        });
      }
    };

    var alpine = window.deferLoadingAlpine || function (alpine) {
      return alpine();
    };

    window.deferLoadingAlpine = function (callback) {
      AlpineComponentMagicMethod.start();
      alpine(callback);
    };

    return AlpineComponentMagicMethod;

})));
