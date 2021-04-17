(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, (global.AlpineMagicHelpers = global.AlpineMagicHelpers || {}, global.AlpineMagicHelpers.truncate = factory()));
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
    var AlpineTruncateMagicMethod = {
      start: function start() {
        var _this = this;

        checkForAlpine();
        Alpine.addMagicProperty('truncate', function () {
          return function () {
            for (var _len = arguments.length, parameters = new Array(_len), _key = 0; _key < _len; _key++) {
              parameters[_key] = arguments[_key];
            }

            if (typeof parameters[0] !== 'string') return parameters[0]; // If the second parameter isn't truthy, return the full string

            if (!parameters[1]) return parameters[0]; // if only a number or string is passed in, keep it simple

            if (typeof parameters[1] !== 'object') {
              return _this.appendEllipsis(parameters[0].slice(0, parameters[1]), parameters);
            } // If words or characters is set, also check that they are truthy. Setting to 0, for example, shoudld show all


            if (Object.prototype.hasOwnProperty.call(parameters[1], 'words') && parameters[1].words) {
              return _this.appendEllipsis(parameters[0].split(' ').splice(0, parameters[1].words).join(' '), parameters);
            }

            if (Object.prototype.hasOwnProperty.call(parameters[1], 'characters') && parameters[1].characters) {
              return _this.appendEllipsis(parameters[0].slice(0, parameters[1].characters), parameters);
            }

            return parameters[0];
          };
        });
      },
      appendEllipsis: function appendEllipsis(string, parameters) {
        if (parameters[0].length <= string.length) return string;
        var ellipsis = '…'; // 3rd parameter is an optional '…' override (soon to be deprecated)

        if (typeof parameters[2] !== 'undefined') {
          ellipsis = parameters[2];
        } // If the second parameter is an object


        if (Object.prototype.hasOwnProperty.call(parameters[1], 'ellipsis')) {
          ellipsis = parameters[1].ellipsis;
        }

        return string + ellipsis;
      }
    };

    var alpine = window.deferLoadingAlpine || function (alpine) {
      return alpine();
    };

    window.deferLoadingAlpine = function (callback) {
      AlpineTruncateMagicMethod.start();
      alpine(callback);
    };

    return AlpineTruncateMagicMethod;

})));
