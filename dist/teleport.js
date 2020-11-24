(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, (global.AlpineMagicHelpers = global.AlpineMagicHelpers || {}, global.AlpineMagicHelpers.teleport = factory()));
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
            if (target[key] !== null && typeof target[key] === 'object') {
              var path = scope ? scope + "." + key : key;
              return new Proxy(target[key], handler(path));
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

    var AlpineTeleportMagicMethod = {
      start: function start() {
        checkForAlpine();
        Alpine.addMagicProperty('teleport', function ($el) {
          return function (from, to, options) {
            if (from === void 0) {
              from = $el;
            }

            if (to === void 0) {
              to = document.body;
            }

            if (options === void 0) {
              options = {
                prepend: false
              };
            }

            // Figure out element that needs to be teleported
            var element = typeof from === 'string' ? document.createRange().createContextualFragment(from) : from; // Figure out destination

            var target = typeof to === 'string' ? document.querySelector(to) : to; // Check if destination is exists

            if (!target) {
              throw Error("Destination \"" + to + "\" not found. Does your element have proper attribute?");
            } // Set mutation to sync initial component data if element is not a component


            if (!element.__x) {
              updateOnMutation($el, function () {
                syncWithObservedComponent($el.__x.getUnobservedData(), $el, objectSetDeep);

                $el.__x.updateElements(element);
              });
            } // Prepend element to destination if 'prepend' option is set to true


            if (options.prepend) return target.prepend(element); // Append element to destination

            target.append(element);
          };
        });
      }
    };

    var alpine = window.deferLoadingAlpine || function (alpine) {
      return alpine();
    };

    window.deferLoadingAlpine = function (callback) {
      AlpineTeleportMagicMethod.start();
      alpine(callback);
    };

    return AlpineTeleportMagicMethod;

})));
