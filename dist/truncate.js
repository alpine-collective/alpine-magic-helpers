(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.truncate = factory());
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

    var AlpineTruncateMagicMethod = {
      start: function start() {
        checkForAlpine();
        Alpine.addMagicProperty('truncate', function () {
          return function () {
            for (var _len = arguments.length, parameters = new Array(_len), _key = 0; _key < _len; _key++) {
              parameters[_key] = arguments[_key];
            }

            if (typeof parameters[0] !== 'string') return parameters[0];
            var truncatedText;
            var ellipsis = '…'; // If the second parameter isn't truthy, return the full string

            if (!parameters[1]) return parameters[0]; // if only a number or string is passed in, keep it simple

            if (typeof parameters[1] !== 'object') {
              if (typeof parameters[2] !== 'undefined') {
                ellipsis = parameters[2];
              }

              truncatedText = parameters[0].slice(0, parameters[1]);
            } else {
              // Customize the …
              if (Object.prototype.hasOwnProperty.call(parameters[1], 'ellipsis')) {
                ellipsis = parameters[1].ellipsis;
              } // If words or characters is set, also check that they are truthy.
              // Setting to 0, for example, should show all


              if (Object.prototype.hasOwnProperty.call(parameters[1], 'words') && parameters[1].words) {
                truncatedText = parameters[0].split(' ').splice(0, parameters[1].words).join(' ');
              } else if (Object.prototype.hasOwnProperty.call(parameters[1], 'characters') && parameters[1].characters) {
                truncatedText = parameters[0].slice(0, parameters[1].characters);
              } else {
                truncatedText = parameters[0];
              }
            } // Only append the ellipsis if the text was truncated


            if (truncatedText.length < parameters[0].length) {
              return truncatedText + ellipsis;
            } else {
              return truncatedText;
            }
          };
        });
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
