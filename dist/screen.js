(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, (global.AlpineMagicHelpers = global.AlpineMagicHelpers || {}, global.AlpineMagicHelpers.screen = factory()));
}(this, (function () { 'use strict';

  function _extends() {
    _extends = Object.assign || function (target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];

        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }

      return target;
    };

    return _extends.apply(this, arguments);
  }

  var Config = /*#__PURE__*/function () {
    function Config() {
      var _this = this;

      this.values = {
        breakpoints: {
          xs: 0,
          sm: 640,
          md: 768,
          lg: 1024,
          xl: 1280,
          '2xl': 1536
        }
      }; // After all assets are loaded but before the page is actually ready when ALpine will kick in

      document.addEventListener('readystatechange', function () {
        if (document.readyState === 'interactive' && window.AlpineMagicHelpersConfig) {
          for (var index in window.AlpineMagicHelpersConfig) {
            _this.values[index] = window.AlpineMagicHelpersConfig[index];
          }
        }
      });
    }

    var _proto = Config.prototype;

    _proto.get = function get(property) {
      return this.values[property] ? this.values[property] : null;
    };

    return Config;
  }();

  var config = new Config();

  var AlpineScreenMagicMethod = {
    start: function start() {
      Alpine.addMagicProperty('screen', function ($el) {
        // bind resize event to window with debounce
        var update;

        var updateScreen = function updateScreen() {
          clearTimeout(update);
          update = setTimeout(function () {
            $el.__x.updateElements($el);
          }, 150); // set $screenHelperInitialized to prevent multiple calls

          window.$screenHelperInitialized = true;
        }; // bind resize event to window if not initialized


        if (!window.$screenHelperInitialized) {
          window.addEventListener('resize', updateScreen);
        }

        return function (target) {
          // Get current window dimensions
          var width = window.innerWidth;
          var height = window.innerHeight; // If size provided as number, early return

          if (Number.isInteger(target)) return target <= width; // Breakpoints and extras

          var screen = _extends({}, config.get('breakpoints'), {
            touch: 'ontouchstart' in window,
            portrait: height > width,
            landscape: width > height
          }); // Check if target exists


          if (screen[target] === undefined) {
            throw Error('Undefined $screen property: ' + target);
          } // return if target is a breakpoint


          if (Number.isInteger(screen[target])) {
            return screen[target] <= width;
          } // return screen extras


          return screen[target];
        };
      });
    }
  };

  var alpine = window.deferLoadingAlpine || function (alpine) {
    return alpine();
  };

  window.deferLoadingAlpine = function (callback) {
    AlpineScreenMagicMethod.start();
    alpine(callback);
  };

  return AlpineScreenMagicMethod;

})));
