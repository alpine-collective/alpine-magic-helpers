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

    var AlpineIntervalMagicMethod = {
      start: function start() {
        checkForAlpine();
        Alpine.addMagicProperty('interval', function () {
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

            var loop = function loop() {
              var test = Object.prototype.hasOwnProperty.call(_this, 'autoIntervalTest') ? _this.autoIntervalTest : true;
              setTimeout(function () {
                if (!_this.autoIntervalLoop) return;
                test && parameters[0].call(_this);
                forceInterval ? _this.autoIntervalLoop() : requestAnimationFrame(_this.autoIntervalLoop);
              }, timer);
            };

            this.autoIntervalLoop = loop;
            setTimeout(function () {
              if (!_this.autoIntervalLoop) return;
              forceInterval ? _this.autoIntervalLoop() : requestAnimationFrame(_this.autoIntervalLoop);
            }, delay);
            this.$watch('autoIntervalTest', function (test) {
              if (test) {
                _this.autoIntervalLoop = loop;
                forceInterval ? _this.autoIntervalLoop() : requestAnimationFrame(_this.autoIntervalLoop);
              } else {
                clearTimeout(_this.autoIntervalLoop);
                _this.autoIntervalLoop = null;
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
