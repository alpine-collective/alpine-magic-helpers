(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, (global.AlpineMagicHelpers = global.AlpineMagicHelpers || {}, global.AlpineMagicHelpers.interval = factory()));
}(this, (function () { 'use strict';

    var checkForAlpine = function checkForAlpine() {
      if (!window.Alpine) {
        throw new Error('[Magic Helpers] Alpine is required for the magic helpers to function correctly.');
      }

      if (!window.Alpine.version || !isValidVersion('2.5.0', window.Alpine.version)) {
        throw new Error('Invalid Alpine version. Please use Alpine version 2.5.0 or above');
      }
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
    function importOrderCheck() {
      // We only want to show the error once
      if (window.Alpine && !window.AlpineMagicHelpers.__fatal) {
        window.AlpineMagicHelpers.__fatal = setTimeout(function () {
          console.error('%c*** ALPINE MAGIC HELPER: Fatal Error! ***\n\n\n' + 'Alpine magic helpers need to be loaded before Alpine ' + 'to avoid errors when Alpine initialises its component. \n\n' + 'Make sure the helper script is included before Alpine in ' + 'your page when using the defer attribute', 'font-size: 14px');
        }, 200); // We set a small timeout to make sure we flush all the Alpine noise first
      }
    }

    importOrderCheck();
    var AlpineIntervalMagicMethod = {
      start: function start() {
        checkForAlpine();
        Alpine.addMagicProperty('interval', function ($el) {
          return function () {
            var _this = this;

            for (var _len = arguments.length, parameters = new Array(_len), _key = 0; _key < _len; _key++) {
              parameters[_key] = arguments[_key];
            }

            if (typeof parameters[0] !== 'function') return parameters[0];
            var timer = parameters[1];
            var delay = 0;
            var forceInterval = false; // Users can pass in an object as a second parameter instead

            if (typeof parameters[1] === 'object') {
              if (Object.prototype.hasOwnProperty.call(parameters[1], 'timer')) {
                timer = parameters[1].timer;
              }

              if (Object.prototype.hasOwnProperty.call(parameters[1], 'delay')) {
                delay = parameters[1].delay;
              }

              if (Object.prototype.hasOwnProperty.call(parameters[1], 'forceInterval')) {
                forceInterval = parameters[1].forceInterval;
              }
            }

            var autoIntervalLoop = null;

            var loop = function loop() {
              autoIntervalLoop = setTimeout(function () {
                parameters[0].call(_this);
                forceInterval ? loop() : requestAnimationFrame(loop);
              }, timer);
            };

            autoIntervalLoop = setTimeout(function () {
              forceInterval ? loop() : requestAnimationFrame(loop);
            }, delay);
            this.$watch('autoIntervalTest', function (test) {
              if (test) {
                forceInterval ? loop() : requestAnimationFrame(loop);
              } else {
                clearTimeout(autoIntervalLoop);
              }
            });
          };
        });
      }
    };

    var alpine = window.deferLoadingAlpine || function (alpine) {
      return alpine();
    };

    window.deferLoadingAlpine = function (callback) {
      AlpineIntervalMagicMethod.start();
      alpine(callback);
    };

    return AlpineIntervalMagicMethod;

})));
