(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, (global.AlpineMagicHelpers = global.AlpineMagicHelpers || {}, global.AlpineMagicHelpers.refresh = factory()));
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
    var AlpineRefreshMagicMethod = {
      start: function start() {
        checkForAlpine();
        Alpine.addMagicProperty('refresh', function ($el) {
          if (!$el.__x) {
            return function () {};
          }

          return function (component) {
            if (component === void 0) {
              component = $el;
            }

            return component.__x.updateElements(component);
          };
        });
      }
    };

    var alpine = window.deferLoadingAlpine || function (alpine) {
      return alpine();
    };

    window.deferLoadingAlpine = function (callback) {
      AlpineRefreshMagicMethod.start();
      alpine(callback);
    };

    return AlpineRefreshMagicMethod;

})));
