(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, (global.AlpineMagicHelpers = global.AlpineMagicHelpers || {}, global.AlpineMagicHelpers.screen = factory()));
}(this, (function () { 'use strict';

    var AlpineScreenMagicMethod = {
      start: function start() {
        Alpine.addMagicProperty('screen', function ($el) {
          return function (breakpoint, framework) {
            if (breakpoint === void 0) {
              breakpoint = 'xs';
            }

            if (framework === void 0) {
              framework = 'tw';
            }

            // Get current window innerWidth
            var width = window.innerWidth; // bind resize event to window with debounce

            var update;
            window.addEventListener('resize', function () {
              clearTimeout(update);
              update = setTimeout(function () {
                $el.__x.updateElements($el);
              }, 150);
            }); // Frameworks and Breakpoints

            var breakpoints = {
              // TailwindCSS
              tw: {
                xs: 0,
                sm: 640,
                md: 768,
                lg: 1024,
                xl: 1280,
                '2xl': 1536
              },
              // Bootstrap
              bs: {
                xs: 0,
                sm: 576,
                md: 768,
                lg: 992,
                xl: 1200
              },
              // Bulma
              bl: {
                mobile: 0,
                tablet: 769,
                desktop: 1024,
                widescreen: 1216,
                fullhd: 1408
              },
              // Materialize
              mt: {
                s: 0,
                m: 601,
                l: 993,
                xl: 1201
              }
            }; // If size provided as number, early return

            if (Number.isInteger(breakpoint)) return breakpoint <= width; // Check if any unsupported frameworks or breakpoints

            if (breakpoints[framework] === undefined) {
              throw Error('Unsupported framework: ' + framework);
            }

            if (breakpoints[framework][breakpoint] === undefined) {
              throw Error('Unsupported $screen breakpoint: ' + breakpoint);
            }

            return breakpoints[framework][breakpoint] <= width;
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
