(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, (global.AlpineMagicHelpers = global.AlpineMagicHelpers || {}, global.AlpineMagicHelpers.screen = factory()));
}(this, (function () { 'use strict';

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

    var screenComponents = []; // Debounce `updateElements` method to prevent memory leak

    var debouncedScreensUpdate = function debouncedScreensUpdate() {
      var update; // Update component if $el is in `screenComponents`

      var updateScreens = function updateScreens() {
        clearTimeout(update);
        update = setTimeout(function () {
          screenComponents.forEach(function ($el) {
            return $el && $el.__x && $el.__x.updateElements($el);
          });
        }, 150);
      };

      return updateScreens;
    };

    var AlpineScreenMagicMethod = {
      start: function start() {
        // Bind `debouncedScreensUpdate` to resize event on window
        // Note that `resize` event will be triggered on `orientationchange` event as well
        window.addEventListener('resize', debouncedScreensUpdate());
        Alpine.addMagicProperty('screen', function ($el) {
          // Push $el if it's not in the `screenComponents`
          if (!screenComponents.includes($el)) {
            screenComponents.push($el);
          }

          return function (breakpoint) {
            // Get current window width
            var width = window.innerWidth; // Early return if breakpoint is provided as number

            if (Number.isInteger(breakpoint)) return breakpoint <= width; // Get breakpoints from Config

            var configBreakpoints = config.get('breakpoints'); // Check if breakpoint exists

            if (configBreakpoints[breakpoint] === undefined) {
              throw Error('Undefined $screen property: ' + breakpoint);
            } // Finally compare breakpoint with window width and return as boolean


            return configBreakpoints[breakpoint] <= width;
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
