(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.truncate = factory());
}(this, (function () { 'use strict';

    var checkForAlpine = function checkForAlpine() {
      if (!window.Alpine) {
        throw new Error('[Magic Helpers] Alpine is required for the magic helpers to function correctly.');
      }
    };

    var AlpineTruncateMagicMethod = {
      start: function start() {
        checkForAlpine();
        Alpine.addMagicProperty('truncate', function () {
          return function () {
            for (var _len = arguments.length, parameters = new Array(_len), _key = 0; _key < _len; _key++) {
              parameters[_key] = arguments[_key];
            }

            if (typeof parameters[0] !== 'string') return parameters[0];
            var ellipsis = '…'; // If the second parameter isn't truthy, return the full string

            if (!parameters[1]) return parameters[0]; // if only a number or string is passed in, keep it simple

            if (typeof parameters[1] !== 'object') {
              if (typeof parameters[2] !== 'undefined') {
                ellipsis = parameters[2];
              }

              return parameters[0].slice(0, parameters[1]) + ellipsis;
            } // Customize the …


            if (parameters[1].hasOwnProperty('ellipsis')) {
              ellipsis = parameters[1].ellipsis;
            } // If words or characters is set, also check that they are truthy. Setting to 0, for example, shoudld show all


            if (parameters[1].hasOwnProperty('words') && parameters[1].words) {
              return parameters[0].split(" ").splice(0, parameters[1].words).join(" ") + ellipsis;
            }

            if (parameters[1].hasOwnProperty('characters') && parameters[1].characters) {
              return parameters[0].slice(0, parameters[1]['characters']) + ellipsis;
            }

            return parameters[0];
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
