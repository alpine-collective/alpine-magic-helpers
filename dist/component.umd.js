!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?module.exports=e():"function"==typeof define&&define.amd?define(e):(t=t||self).magicHelpers=e()}(this,function(){var t=function(t,e,n){return void 0===n&&(n={}),"function"==typeof t?t.call(e):new Function(["$data"].concat(Object.keys(n)),"var __alpine_result; with($data) { __alpine_result = "+t+" }; return __alpine_result").apply(void 0,[e].concat(Object.values(n)))},e={start:function(){!function(){if(!window.Alpine)throw new Error("[Magic Helpers] Alpine is required for the magic helpers to function correctly.")}(),Alpine.addMagicProperty("parent",function(e){if(void 0!==e.$parent)return e.$parent;var r,o=e.parentNode.closest("[x-data]");if(!o)throw new Error("Parent component not found");return r=o.__x?o.__x.getUnobservedData():t(o.getAttribute("x-data"),o),e.$parent=n(r,o),new MutationObserver(function(t){for(var r=0;r<t.length;r++){var a=t[r].target.closest("[x-data]");if(!a||a.isSameNode(o)){if(!a.__x)throw"Error locating $parent data";e.$parent=n(a.__x.getUnobservedData(),o),e.__x.updateElements(e)}}}).observe(o,{attributes:!0,childList:!0,characterData:!0,subtree:!0}),r}),Alpine.addMagicProperty("component",function(){return function(e){var r=this;if(void 0!==this[e])return this[e];var o,a=document.querySelector('[x-data][x-id="'+e+'"], [x-data]#'+e);if(!a)throw"Component not found";return o=a.__x?a.__x.getUnobservedData():t(a.getAttribute("x-data"),a),this[e]=n(o,a),new MutationObserver(function(t){for(var o=0;o<t.length;o++){var i=t[o].target.closest("[x-data]");if(!i||!i.isSameNode(r.$el)){if(!i.__x)throw"Error locating $component data";r[e]=n(i.__x.getUnobservedData(),a)}}}).observe(a,{attributes:!0,childList:!0,characterData:!0,subtree:!0}),this[e]}})}},n=function(t,e){return new Proxy(t,{set:function(t,n,r){if(!e.__x)throw new Error("Failed to communicate with observed component");return e.__x.$data[n]=r,!0}})},r=window.deferLoadingAlpine||function(t){return t()};return window.deferLoadingAlpine=function(t){r(t),e.start()},e});
//# sourceMappingURL=component.umd.js.map
