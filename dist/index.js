(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, (global.AlpineMagicHelpers = global.AlpineMagicHelpers || {}, global.AlpineMagicHelpers.index = factory()));
}(this, (function () { 'use strict';

    var checkForAlpine = function checkForAlpine() {
      if (!window.Alpine) {
        throw new Error('[Magic Helpers] Alpine is required for the magic helpers to function correctly.');
      }

      if (!window.Alpine.version || !isValidVersion('2.5.0', window.Alpine.version)) {
        throw new Error('Invalid Alpine version. Please use Alpine version 2.5.0 or above');
      }
    };
    var syncWithObservedComponent = function syncWithObservedComponent(data, observedComponent, callback) {
      if (!observedComponent.getAttribute('x-bind:data-last-refresh')) {
        observedComponent.setAttribute('x-bind:data-last-refresh', 'Date.now()');
      }

      var handler = function handler(scope) {
        if (scope === void 0) {
          scope = null;
        }

        return {
          get: function get(target, key) {
            var _observedComponent$__;

            if (target[key] !== null && typeof target[key] === 'object') {
              var path = scope ? scope + "." + key : key;
              return new Proxy(target[key], handler(path));
            } // We bind the scope only if the observed component is ready.
            // Most of the time, the unwrapped data is enough


            if (typeof target[key] === 'function' && observedComponent.__x) {
              return target[key].bind(observedComponent.__x.$data);
            } // If scope is null, we are at root level so when target[key] is not defined
            // we try to look for observedComponent.__x.$data[key] to check if a magic
            // helper/property exists


            if (scope === null && !target[key] && observedComponent != null && (_observedComponent$__ = observedComponent.__x) != null && _observedComponent$__.$data[key]) {
              return observedComponent.__x.$data[key];
            }

            return target[key];
          },
          set: function set(_target, key, value) {
            if (!observedComponent.__x) {
              throw new Error('Error communicating with observed component');
            }

            var path = scope ? scope + "." + key : key;
            callback.call(observedComponent, observedComponent.__x.$data, path, value);
            return true;
          }
        };
      };

      return new Proxy(data, handler());
    };
    var updateOnMutation = function updateOnMutation(componentBeingObserved, callback) {
      if (!componentBeingObserved.getAttribute('x-bind:data-last-refresh')) {
        componentBeingObserved.setAttribute('x-bind:data-last-refresh', 'Date.now()');
      }

      var observer = new MutationObserver(function (mutations) {
        for (var i = 0; i < mutations.length; i++) {
          var mutatedComponent = mutations[i].target.closest('[x-data]');
          if (mutatedComponent && !mutatedComponent.isSameNode(componentBeingObserved)) continue;
          callback();
          return;
        }
      });
      observer.observe(componentBeingObserved, {
        attributes: true,
        childList: true,
        subtree: true
      });
    }; // Borrowed from https://stackoverflow.com/a/54733755/1437789

    var objectSetDeep = function objectSetDeep(object, path, value) {
      path = path.toString().match(/[^.[\]]+/g) || []; // Iterate all of them except the last one

      path.slice(0, -1).reduce(function (a, currentKey, index) {
        // If the key does not exist or its value is not an object, create/override the key
        if (Object(a[currentKey]) !== a[currentKey]) {
          // Is the next key a potential array-index?
          a[currentKey] = Math.abs(path[index + 1]) >> 0 === +path[index + 1] ? [] // Yes: assign a new array object
          : {}; // No: assign a new plain object
        }

        return a[currentKey];
      }, object)[path[path.length - 1]] = value; // Finally assign the value to the last key

      return object;
    }; // Returns component data if Alpine has made it available, otherwise computes it with saferEval()

    var componentData = function componentData(component, properties) {
      var data = component.__x ? component.__x.getUnobservedData() : saferEval(component.getAttribute('x-data'), component);

      if (properties) {
        properties = Array.isArray(properties) ? properties : [properties];
        return properties.reduce(function (object, key) {
          object[key] = data[key];
          return object;
        }, {});
      }

      return data;
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

    function saferEval(expression, dataContext, additionalHelperVariables) {
      if (additionalHelperVariables === void 0) {
        additionalHelperVariables = {};
      }

      if (typeof expression === 'function') {
        return expression.call(dataContext);
      } // eslint-disable-next-line no-new-func


      return new Function(['$data'].concat(Object.keys(additionalHelperVariables)), "var __alpine_result; with($data) { __alpine_result = " + expression + " }; return __alpine_result").apply(void 0, [dataContext].concat(Object.values(additionalHelperVariables)));
    } // Returns a dummy proxy that supports multiple levels of nesting and always prints/returns an empty string.


    function getNoopProxy() {
      var handler = {
        get: function get(target, key) {
          return new Proxy(function () {
            return '';
          }, handler);
        }
      };
      return new Proxy(function () {
        return '';
      }, handler);
    } // Continuously check the observed component until it's ready.
    // It returns an object that always spits out an empty string while waiting (See getNoopProxy).

    function waitUntilReady(componentBeingObserved, component, callback) {
      if (!componentBeingObserved.__x) {
        window.requestAnimationFrame(function () {
          return component.__x.updateElements(component);
        });
        return getNoopProxy();
      }

      return callback();
    }
    var X_ATTR_RE = /^x-([a-z-]*)\b/i;

    function parseHtmlAttribute(_ref) {
      var name = _ref.name,
          value = _ref.value;
      var typeMatch = name.match(X_ATTR_RE);
      var valueMatch = name.match(/:([a-z0-9\-:]+)/i);
      var modifiers = name.match(/\.[^.\]]+(?=[^\]]*$)/g) || [];
      return {
        type: typeMatch ? typeMatch[1] : null,
        value: valueMatch ? valueMatch[1] : null,
        modifiers: modifiers.map(function (i) {
          return i.replace('.', '');
        }),
        expression: value
      };
    }

    function getXDirectives(el) {
      return Array.from(el.attributes).filter(function (attr) {
        return X_ATTR_RE.test(attr.name);
      }).map(parseHtmlAttribute);
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
    var AlpineComponentMagicMethod = {
      start: function start() {
        checkForAlpine();
        Alpine.addMagicProperty('parent', function ($el) {
          if (typeof $el.$parent !== 'undefined') return $el.$parent;
          var parentComponent = $el.parentNode.closest('[x-data]');
          if (!parentComponent) throw new Error('Parent component not found'); // If the parent component is not ready, we return a dummy proxy
          // that always prints out an empty string and we check again on the next frame
          // We are de facto deferring the value for a few ms but final users
          // shouldn't notice the delay

          return waitUntilReady(parentComponent, $el, function () {
            $el.$parent = syncWithObservedComponent(componentData(parentComponent), parentComponent, objectSetDeep);
            updateOnMutation(parentComponent, function () {
              $el.$parent = syncWithObservedComponent(parentComponent.__x.getUnobservedData(), parentComponent, objectSetDeep);

              $el.__x.updateElements($el);
            });
            return $el.$parent;
          });
        });
        Alpine.addMagicProperty('component', function ($el) {
          return function (componentName) {
            var _this = this;

            if (typeof this[componentName] !== 'undefined') return this[componentName];
            var componentBeingObserved = document.querySelector("[x-data][x-id=\"" + componentName + "\"], [x-data]#" + componentName);
            if (!componentBeingObserved) throw new Error('Component not found'); // If the observed component is not ready, we return a dummy proxy
            // that always prints out an empty string and we check again on the next frame
            // We are de facto deferring the value for a few ms but final users
            // shouldn't notice the delay

            return waitUntilReady(componentBeingObserved, $el, function () {
              _this[componentName] = syncWithObservedComponent(componentData(componentBeingObserved), componentBeingObserved, objectSetDeep);
              updateOnMutation(componentBeingObserved, function () {
                _this[componentName] = syncWithObservedComponent(componentBeingObserved.__x.getUnobservedData(), componentBeingObserved, objectSetDeep);

                $el.__x.updateElements($el);
              });
              return _this[componentName];
            });
          };
        });
      }
    };

    var alpine$9 = window.deferLoadingAlpine || function (alpine) {
      return alpine();
    };

    window.deferLoadingAlpine = function (callback) {
      AlpineComponentMagicMethod.start();
      alpine$9(callback);
    };

    var bind = function bind(fn, thisArg) {
      return function wrap() {
        var args = new Array(arguments.length);
        for (var i = 0; i < args.length; i++) {
          args[i] = arguments[i];
        }
        return fn.apply(thisArg, args);
      };
    };

    /*global toString:true*/

    // utils is a library of generic helper functions non-specific to axios

    var toString = Object.prototype.toString;

    /**
     * Determine if a value is an Array
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an Array, otherwise false
     */
    function isArray(val) {
      return toString.call(val) === '[object Array]';
    }

    /**
     * Determine if a value is undefined
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if the value is undefined, otherwise false
     */
    function isUndefined(val) {
      return typeof val === 'undefined';
    }

    /**
     * Determine if a value is a Buffer
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Buffer, otherwise false
     */
    function isBuffer(val) {
      return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor)
        && typeof val.constructor.isBuffer === 'function' && val.constructor.isBuffer(val);
    }

    /**
     * Determine if a value is an ArrayBuffer
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an ArrayBuffer, otherwise false
     */
    function isArrayBuffer(val) {
      return toString.call(val) === '[object ArrayBuffer]';
    }

    /**
     * Determine if a value is a FormData
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an FormData, otherwise false
     */
    function isFormData(val) {
      return (typeof FormData !== 'undefined') && (val instanceof FormData);
    }

    /**
     * Determine if a value is a view on an ArrayBuffer
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
     */
    function isArrayBufferView(val) {
      var result;
      if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
        result = ArrayBuffer.isView(val);
      } else {
        result = (val) && (val.buffer) && (val.buffer instanceof ArrayBuffer);
      }
      return result;
    }

    /**
     * Determine if a value is a String
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a String, otherwise false
     */
    function isString(val) {
      return typeof val === 'string';
    }

    /**
     * Determine if a value is a Number
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Number, otherwise false
     */
    function isNumber(val) {
      return typeof val === 'number';
    }

    /**
     * Determine if a value is an Object
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an Object, otherwise false
     */
    function isObject(val) {
      return val !== null && typeof val === 'object';
    }

    /**
     * Determine if a value is a plain Object
     *
     * @param {Object} val The value to test
     * @return {boolean} True if value is a plain Object, otherwise false
     */
    function isPlainObject(val) {
      if (toString.call(val) !== '[object Object]') {
        return false;
      }

      var prototype = Object.getPrototypeOf(val);
      return prototype === null || prototype === Object.prototype;
    }

    /**
     * Determine if a value is a Date
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Date, otherwise false
     */
    function isDate(val) {
      return toString.call(val) === '[object Date]';
    }

    /**
     * Determine if a value is a File
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a File, otherwise false
     */
    function isFile(val) {
      return toString.call(val) === '[object File]';
    }

    /**
     * Determine if a value is a Blob
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Blob, otherwise false
     */
    function isBlob(val) {
      return toString.call(val) === '[object Blob]';
    }

    /**
     * Determine if a value is a Function
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Function, otherwise false
     */
    function isFunction(val) {
      return toString.call(val) === '[object Function]';
    }

    /**
     * Determine if a value is a Stream
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Stream, otherwise false
     */
    function isStream(val) {
      return isObject(val) && isFunction(val.pipe);
    }

    /**
     * Determine if a value is a URLSearchParams object
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a URLSearchParams object, otherwise false
     */
    function isURLSearchParams(val) {
      return typeof URLSearchParams !== 'undefined' && val instanceof URLSearchParams;
    }

    /**
     * Trim excess whitespace off the beginning and end of a string
     *
     * @param {String} str The String to trim
     * @returns {String} The String freed of excess whitespace
     */
    function trim(str) {
      return str.replace(/^\s*/, '').replace(/\s*$/, '');
    }

    /**
     * Determine if we're running in a standard browser environment
     *
     * This allows axios to run in a web worker, and react-native.
     * Both environments support XMLHttpRequest, but not fully standard globals.
     *
     * web workers:
     *  typeof window -> undefined
     *  typeof document -> undefined
     *
     * react-native:
     *  navigator.product -> 'ReactNative'
     * nativescript
     *  navigator.product -> 'NativeScript' or 'NS'
     */
    function isStandardBrowserEnv() {
      if (typeof navigator !== 'undefined' && (navigator.product === 'ReactNative' ||
                                               navigator.product === 'NativeScript' ||
                                               navigator.product === 'NS')) {
        return false;
      }
      return (
        typeof window !== 'undefined' &&
        typeof document !== 'undefined'
      );
    }

    /**
     * Iterate over an Array or an Object invoking a function for each item.
     *
     * If `obj` is an Array callback will be called passing
     * the value, index, and complete array for each item.
     *
     * If 'obj' is an Object callback will be called passing
     * the value, key, and complete object for each property.
     *
     * @param {Object|Array} obj The object to iterate
     * @param {Function} fn The callback to invoke for each item
     */
    function forEach(obj, fn) {
      // Don't bother if no value provided
      if (obj === null || typeof obj === 'undefined') {
        return;
      }

      // Force an array if not already something iterable
      if (typeof obj !== 'object') {
        /*eslint no-param-reassign:0*/
        obj = [obj];
      }

      if (isArray(obj)) {
        // Iterate over array values
        for (var i = 0, l = obj.length; i < l; i++) {
          fn.call(null, obj[i], i, obj);
        }
      } else {
        // Iterate over object keys
        for (var key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            fn.call(null, obj[key], key, obj);
          }
        }
      }
    }

    /**
     * Accepts varargs expecting each argument to be an object, then
     * immutably merges the properties of each object and returns result.
     *
     * When multiple objects contain the same key the later object in
     * the arguments list will take precedence.
     *
     * Example:
     *
     * ```js
     * var result = merge({foo: 123}, {foo: 456});
     * console.log(result.foo); // outputs 456
     * ```
     *
     * @param {Object} obj1 Object to merge
     * @returns {Object} Result of all merge properties
     */
    function merge(/* obj1, obj2, obj3, ... */) {
      var result = {};
      function assignValue(val, key) {
        if (isPlainObject(result[key]) && isPlainObject(val)) {
          result[key] = merge(result[key], val);
        } else if (isPlainObject(val)) {
          result[key] = merge({}, val);
        } else if (isArray(val)) {
          result[key] = val.slice();
        } else {
          result[key] = val;
        }
      }

      for (var i = 0, l = arguments.length; i < l; i++) {
        forEach(arguments[i], assignValue);
      }
      return result;
    }

    /**
     * Extends object a by mutably adding to it the properties of object b.
     *
     * @param {Object} a The object to be extended
     * @param {Object} b The object to copy properties from
     * @param {Object} thisArg The object to bind function to
     * @return {Object} The resulting value of object a
     */
    function extend(a, b, thisArg) {
      forEach(b, function assignValue(val, key) {
        if (thisArg && typeof val === 'function') {
          a[key] = bind(val, thisArg);
        } else {
          a[key] = val;
        }
      });
      return a;
    }

    /**
     * Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
     *
     * @param {string} content with BOM
     * @return {string} content value without BOM
     */
    function stripBOM(content) {
      if (content.charCodeAt(0) === 0xFEFF) {
        content = content.slice(1);
      }
      return content;
    }

    var utils = {
      isArray: isArray,
      isArrayBuffer: isArrayBuffer,
      isBuffer: isBuffer,
      isFormData: isFormData,
      isArrayBufferView: isArrayBufferView,
      isString: isString,
      isNumber: isNumber,
      isObject: isObject,
      isPlainObject: isPlainObject,
      isUndefined: isUndefined,
      isDate: isDate,
      isFile: isFile,
      isBlob: isBlob,
      isFunction: isFunction,
      isStream: isStream,
      isURLSearchParams: isURLSearchParams,
      isStandardBrowserEnv: isStandardBrowserEnv,
      forEach: forEach,
      merge: merge,
      extend: extend,
      trim: trim,
      stripBOM: stripBOM
    };

    function encode(val) {
      return encodeURIComponent(val).
        replace(/%3A/gi, ':').
        replace(/%24/g, '$').
        replace(/%2C/gi, ',').
        replace(/%20/g, '+').
        replace(/%5B/gi, '[').
        replace(/%5D/gi, ']');
    }

    /**
     * Build a URL by appending params to the end
     *
     * @param {string} url The base of the url (e.g., http://www.google.com)
     * @param {object} [params] The params to be appended
     * @returns {string} The formatted url
     */
    var buildURL = function buildURL(url, params, paramsSerializer) {
      /*eslint no-param-reassign:0*/
      if (!params) {
        return url;
      }

      var serializedParams;
      if (paramsSerializer) {
        serializedParams = paramsSerializer(params);
      } else if (utils.isURLSearchParams(params)) {
        serializedParams = params.toString();
      } else {
        var parts = [];

        utils.forEach(params, function serialize(val, key) {
          if (val === null || typeof val === 'undefined') {
            return;
          }

          if (utils.isArray(val)) {
            key = key + '[]';
          } else {
            val = [val];
          }

          utils.forEach(val, function parseValue(v) {
            if (utils.isDate(v)) {
              v = v.toISOString();
            } else if (utils.isObject(v)) {
              v = JSON.stringify(v);
            }
            parts.push(encode(key) + '=' + encode(v));
          });
        });

        serializedParams = parts.join('&');
      }

      if (serializedParams) {
        var hashmarkIndex = url.indexOf('#');
        if (hashmarkIndex !== -1) {
          url = url.slice(0, hashmarkIndex);
        }

        url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
      }

      return url;
    };

    function InterceptorManager() {
      this.handlers = [];
    }

    /**
     * Add a new interceptor to the stack
     *
     * @param {Function} fulfilled The function to handle `then` for a `Promise`
     * @param {Function} rejected The function to handle `reject` for a `Promise`
     *
     * @return {Number} An ID used to remove interceptor later
     */
    InterceptorManager.prototype.use = function use(fulfilled, rejected) {
      this.handlers.push({
        fulfilled: fulfilled,
        rejected: rejected
      });
      return this.handlers.length - 1;
    };

    /**
     * Remove an interceptor from the stack
     *
     * @param {Number} id The ID that was returned by `use`
     */
    InterceptorManager.prototype.eject = function eject(id) {
      if (this.handlers[id]) {
        this.handlers[id] = null;
      }
    };

    /**
     * Iterate over all the registered interceptors
     *
     * This method is particularly useful for skipping over any
     * interceptors that may have become `null` calling `eject`.
     *
     * @param {Function} fn The function to call for each interceptor
     */
    InterceptorManager.prototype.forEach = function forEach(fn) {
      utils.forEach(this.handlers, function forEachHandler(h) {
        if (h !== null) {
          fn(h);
        }
      });
    };

    var InterceptorManager_1 = InterceptorManager;

    /**
     * Transform the data for a request or a response
     *
     * @param {Object|String} data The data to be transformed
     * @param {Array} headers The headers for the request or response
     * @param {Array|Function} fns A single function or Array of functions
     * @returns {*} The resulting transformed data
     */
    var transformData = function transformData(data, headers, fns) {
      /*eslint no-param-reassign:0*/
      utils.forEach(fns, function transform(fn) {
        data = fn(data, headers);
      });

      return data;
    };

    var isCancel = function isCancel(value) {
      return !!(value && value.__CANCEL__);
    };

    var normalizeHeaderName = function normalizeHeaderName(headers, normalizedName) {
      utils.forEach(headers, function processHeader(value, name) {
        if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
          headers[normalizedName] = value;
          delete headers[name];
        }
      });
    };

    /**
     * Update an Error with the specified config, error code, and response.
     *
     * @param {Error} error The error to update.
     * @param {Object} config The config.
     * @param {string} [code] The error code (for example, 'ECONNABORTED').
     * @param {Object} [request] The request.
     * @param {Object} [response] The response.
     * @returns {Error} The error.
     */
    var enhanceError = function enhanceError(error, config, code, request, response) {
      error.config = config;
      if (code) {
        error.code = code;
      }

      error.request = request;
      error.response = response;
      error.isAxiosError = true;

      error.toJSON = function toJSON() {
        return {
          // Standard
          message: this.message,
          name: this.name,
          // Microsoft
          description: this.description,
          number: this.number,
          // Mozilla
          fileName: this.fileName,
          lineNumber: this.lineNumber,
          columnNumber: this.columnNumber,
          stack: this.stack,
          // Axios
          config: this.config,
          code: this.code
        };
      };
      return error;
    };

    /**
     * Create an Error with the specified message, config, error code, request and response.
     *
     * @param {string} message The error message.
     * @param {Object} config The config.
     * @param {string} [code] The error code (for example, 'ECONNABORTED').
     * @param {Object} [request] The request.
     * @param {Object} [response] The response.
     * @returns {Error} The created error.
     */
    var createError = function createError(message, config, code, request, response) {
      var error = new Error(message);
      return enhanceError(error, config, code, request, response);
    };

    /**
     * Resolve or reject a Promise based on response status.
     *
     * @param {Function} resolve A function that resolves the promise.
     * @param {Function} reject A function that rejects the promise.
     * @param {object} response The response.
     */
    var settle = function settle(resolve, reject, response) {
      var validateStatus = response.config.validateStatus;
      if (!response.status || !validateStatus || validateStatus(response.status)) {
        resolve(response);
      } else {
        reject(createError(
          'Request failed with status code ' + response.status,
          response.config,
          null,
          response.request,
          response
        ));
      }
    };

    var cookies = (
      utils.isStandardBrowserEnv() ?

      // Standard browser envs support document.cookie
        (function standardBrowserEnv() {
          return {
            write: function write(name, value, expires, path, domain, secure) {
              var cookie = [];
              cookie.push(name + '=' + encodeURIComponent(value));

              if (utils.isNumber(expires)) {
                cookie.push('expires=' + new Date(expires).toGMTString());
              }

              if (utils.isString(path)) {
                cookie.push('path=' + path);
              }

              if (utils.isString(domain)) {
                cookie.push('domain=' + domain);
              }

              if (secure === true) {
                cookie.push('secure');
              }

              document.cookie = cookie.join('; ');
            },

            read: function read(name) {
              var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
              return (match ? decodeURIComponent(match[3]) : null);
            },

            remove: function remove(name) {
              this.write(name, '', Date.now() - 86400000);
            }
          };
        })() :

      // Non standard browser env (web workers, react-native) lack needed support.
        (function nonStandardBrowserEnv() {
          return {
            write: function write() {},
            read: function read() { return null; },
            remove: function remove() {}
          };
        })()
    );

    /**
     * Determines whether the specified URL is absolute
     *
     * @param {string} url The URL to test
     * @returns {boolean} True if the specified URL is absolute, otherwise false
     */
    var isAbsoluteURL = function isAbsoluteURL(url) {
      // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
      // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
      // by any combination of letters, digits, plus, period, or hyphen.
      return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url);
    };

    /**
     * Creates a new URL by combining the specified URLs
     *
     * @param {string} baseURL The base URL
     * @param {string} relativeURL The relative URL
     * @returns {string} The combined URL
     */
    var combineURLs = function combineURLs(baseURL, relativeURL) {
      return relativeURL
        ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
        : baseURL;
    };

    /**
     * Creates a new URL by combining the baseURL with the requestedURL,
     * only when the requestedURL is not already an absolute URL.
     * If the requestURL is absolute, this function returns the requestedURL untouched.
     *
     * @param {string} baseURL The base URL
     * @param {string} requestedURL Absolute or relative URL to combine
     * @returns {string} The combined full path
     */
    var buildFullPath = function buildFullPath(baseURL, requestedURL) {
      if (baseURL && !isAbsoluteURL(requestedURL)) {
        return combineURLs(baseURL, requestedURL);
      }
      return requestedURL;
    };

    // Headers whose duplicates are ignored by node
    // c.f. https://nodejs.org/api/http.html#http_message_headers
    var ignoreDuplicateOf = [
      'age', 'authorization', 'content-length', 'content-type', 'etag',
      'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
      'last-modified', 'location', 'max-forwards', 'proxy-authorization',
      'referer', 'retry-after', 'user-agent'
    ];

    /**
     * Parse headers into an object
     *
     * ```
     * Date: Wed, 27 Aug 2014 08:58:49 GMT
     * Content-Type: application/json
     * Connection: keep-alive
     * Transfer-Encoding: chunked
     * ```
     *
     * @param {String} headers Headers needing to be parsed
     * @returns {Object} Headers parsed into an object
     */
    var parseHeaders = function parseHeaders(headers) {
      var parsed = {};
      var key;
      var val;
      var i;

      if (!headers) { return parsed; }

      utils.forEach(headers.split('\n'), function parser(line) {
        i = line.indexOf(':');
        key = utils.trim(line.substr(0, i)).toLowerCase();
        val = utils.trim(line.substr(i + 1));

        if (key) {
          if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
            return;
          }
          if (key === 'set-cookie') {
            parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
          } else {
            parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
          }
        }
      });

      return parsed;
    };

    var isURLSameOrigin = (
      utils.isStandardBrowserEnv() ?

      // Standard browser envs have full support of the APIs needed to test
      // whether the request URL is of the same origin as current location.
        (function standardBrowserEnv() {
          var msie = /(msie|trident)/i.test(navigator.userAgent);
          var urlParsingNode = document.createElement('a');
          var originURL;

          /**
        * Parse a URL to discover it's components
        *
        * @param {String} url The URL to be parsed
        * @returns {Object}
        */
          function resolveURL(url) {
            var href = url;

            if (msie) {
            // IE needs attribute set twice to normalize properties
              urlParsingNode.setAttribute('href', href);
              href = urlParsingNode.href;
            }

            urlParsingNode.setAttribute('href', href);

            // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
            return {
              href: urlParsingNode.href,
              protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
              host: urlParsingNode.host,
              search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
              hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
              hostname: urlParsingNode.hostname,
              port: urlParsingNode.port,
              pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
                urlParsingNode.pathname :
                '/' + urlParsingNode.pathname
            };
          }

          originURL = resolveURL(window.location.href);

          /**
        * Determine if a URL shares the same origin as the current location
        *
        * @param {String} requestURL The URL to test
        * @returns {boolean} True if URL shares the same origin, otherwise false
        */
          return function isURLSameOrigin(requestURL) {
            var parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
            return (parsed.protocol === originURL.protocol &&
                parsed.host === originURL.host);
          };
        })() :

      // Non standard browser envs (web workers, react-native) lack needed support.
        (function nonStandardBrowserEnv() {
          return function isURLSameOrigin() {
            return true;
          };
        })()
    );

    var xhr = function xhrAdapter(config) {
      return new Promise(function dispatchXhrRequest(resolve, reject) {
        var requestData = config.data;
        var requestHeaders = config.headers;

        if (utils.isFormData(requestData)) {
          delete requestHeaders['Content-Type']; // Let the browser set it
        }

        var request = new XMLHttpRequest();

        // HTTP basic authentication
        if (config.auth) {
          var username = config.auth.username || '';
          var password = config.auth.password ? unescape(encodeURIComponent(config.auth.password)) : '';
          requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
        }

        var fullPath = buildFullPath(config.baseURL, config.url);
        request.open(config.method.toUpperCase(), buildURL(fullPath, config.params, config.paramsSerializer), true);

        // Set the request timeout in MS
        request.timeout = config.timeout;

        // Listen for ready state
        request.onreadystatechange = function handleLoad() {
          if (!request || request.readyState !== 4) {
            return;
          }

          // The request errored out and we didn't get a response, this will be
          // handled by onerror instead
          // With one exception: request that using file: protocol, most browsers
          // will return status as 0 even though it's a successful request
          if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
            return;
          }

          // Prepare the response
          var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
          var responseData = !config.responseType || config.responseType === 'text' ? request.responseText : request.response;
          var response = {
            data: responseData,
            status: request.status,
            statusText: request.statusText,
            headers: responseHeaders,
            config: config,
            request: request
          };

          settle(resolve, reject, response);

          // Clean up request
          request = null;
        };

        // Handle browser request cancellation (as opposed to a manual cancellation)
        request.onabort = function handleAbort() {
          if (!request) {
            return;
          }

          reject(createError('Request aborted', config, 'ECONNABORTED', request));

          // Clean up request
          request = null;
        };

        // Handle low level network errors
        request.onerror = function handleError() {
          // Real errors are hidden from us by the browser
          // onerror should only fire if it's a network error
          reject(createError('Network Error', config, null, request));

          // Clean up request
          request = null;
        };

        // Handle timeout
        request.ontimeout = function handleTimeout() {
          var timeoutErrorMessage = 'timeout of ' + config.timeout + 'ms exceeded';
          if (config.timeoutErrorMessage) {
            timeoutErrorMessage = config.timeoutErrorMessage;
          }
          reject(createError(timeoutErrorMessage, config, 'ECONNABORTED',
            request));

          // Clean up request
          request = null;
        };

        // Add xsrf header
        // This is only done if running in a standard browser environment.
        // Specifically not if we're in a web worker, or react-native.
        if (utils.isStandardBrowserEnv()) {
          // Add xsrf header
          var xsrfValue = (config.withCredentials || isURLSameOrigin(fullPath)) && config.xsrfCookieName ?
            cookies.read(config.xsrfCookieName) :
            undefined;

          if (xsrfValue) {
            requestHeaders[config.xsrfHeaderName] = xsrfValue;
          }
        }

        // Add headers to the request
        if ('setRequestHeader' in request) {
          utils.forEach(requestHeaders, function setRequestHeader(val, key) {
            if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
              // Remove Content-Type if data is undefined
              delete requestHeaders[key];
            } else {
              // Otherwise add header to the request
              request.setRequestHeader(key, val);
            }
          });
        }

        // Add withCredentials to request if needed
        if (!utils.isUndefined(config.withCredentials)) {
          request.withCredentials = !!config.withCredentials;
        }

        // Add responseType to request if needed
        if (config.responseType) {
          try {
            request.responseType = config.responseType;
          } catch (e) {
            // Expected DOMException thrown by browsers not compatible XMLHttpRequest Level 2.
            // But, this can be suppressed for 'json' type as it can be parsed by default 'transformResponse' function.
            if (config.responseType !== 'json') {
              throw e;
            }
          }
        }

        // Handle progress if needed
        if (typeof config.onDownloadProgress === 'function') {
          request.addEventListener('progress', config.onDownloadProgress);
        }

        // Not all browsers support upload events
        if (typeof config.onUploadProgress === 'function' && request.upload) {
          request.upload.addEventListener('progress', config.onUploadProgress);
        }

        if (config.cancelToken) {
          // Handle cancellation
          config.cancelToken.promise.then(function onCanceled(cancel) {
            if (!request) {
              return;
            }

            request.abort();
            reject(cancel);
            // Clean up request
            request = null;
          });
        }

        if (!requestData) {
          requestData = null;
        }

        // Send the request
        request.send(requestData);
      });
    };

    var DEFAULT_CONTENT_TYPE = {
      'Content-Type': 'application/x-www-form-urlencoded'
    };

    function setContentTypeIfUnset(headers, value) {
      if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
        headers['Content-Type'] = value;
      }
    }

    function getDefaultAdapter() {
      var adapter;
      if (typeof XMLHttpRequest !== 'undefined') {
        // For browsers use XHR adapter
        adapter = xhr;
      } else if (typeof process !== 'undefined' && Object.prototype.toString.call(process) === '[object process]') {
        // For node use HTTP adapter
        adapter = xhr;
      }
      return adapter;
    }

    var defaults = {
      adapter: getDefaultAdapter(),

      transformRequest: [function transformRequest(data, headers) {
        normalizeHeaderName(headers, 'Accept');
        normalizeHeaderName(headers, 'Content-Type');
        if (utils.isFormData(data) ||
          utils.isArrayBuffer(data) ||
          utils.isBuffer(data) ||
          utils.isStream(data) ||
          utils.isFile(data) ||
          utils.isBlob(data)
        ) {
          return data;
        }
        if (utils.isArrayBufferView(data)) {
          return data.buffer;
        }
        if (utils.isURLSearchParams(data)) {
          setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
          return data.toString();
        }
        if (utils.isObject(data)) {
          setContentTypeIfUnset(headers, 'application/json;charset=utf-8');
          return JSON.stringify(data);
        }
        return data;
      }],

      transformResponse: [function transformResponse(data) {
        /*eslint no-param-reassign:0*/
        if (typeof data === 'string') {
          try {
            data = JSON.parse(data);
          } catch (e) { /* Ignore */ }
        }
        return data;
      }],

      /**
       * A timeout in milliseconds to abort a request. If set to 0 (default) a
       * timeout is not created.
       */
      timeout: 0,

      xsrfCookieName: 'XSRF-TOKEN',
      xsrfHeaderName: 'X-XSRF-TOKEN',

      maxContentLength: -1,
      maxBodyLength: -1,

      validateStatus: function validateStatus(status) {
        return status >= 200 && status < 300;
      }
    };

    defaults.headers = {
      common: {
        'Accept': 'application/json, text/plain, */*'
      }
    };

    utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
      defaults.headers[method] = {};
    });

    utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
      defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
    });

    var defaults_1 = defaults;

    /**
     * Throws a `Cancel` if cancellation has been requested.
     */
    function throwIfCancellationRequested(config) {
      if (config.cancelToken) {
        config.cancelToken.throwIfRequested();
      }
    }

    /**
     * Dispatch a request to the server using the configured adapter.
     *
     * @param {object} config The config that is to be used for the request
     * @returns {Promise} The Promise to be fulfilled
     */
    var dispatchRequest = function dispatchRequest(config) {
      throwIfCancellationRequested(config);

      // Ensure headers exist
      config.headers = config.headers || {};

      // Transform request data
      config.data = transformData(
        config.data,
        config.headers,
        config.transformRequest
      );

      // Flatten headers
      config.headers = utils.merge(
        config.headers.common || {},
        config.headers[config.method] || {},
        config.headers
      );

      utils.forEach(
        ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
        function cleanHeaderConfig(method) {
          delete config.headers[method];
        }
      );

      var adapter = config.adapter || defaults_1.adapter;

      return adapter(config).then(function onAdapterResolution(response) {
        throwIfCancellationRequested(config);

        // Transform response data
        response.data = transformData(
          response.data,
          response.headers,
          config.transformResponse
        );

        return response;
      }, function onAdapterRejection(reason) {
        if (!isCancel(reason)) {
          throwIfCancellationRequested(config);

          // Transform response data
          if (reason && reason.response) {
            reason.response.data = transformData(
              reason.response.data,
              reason.response.headers,
              config.transformResponse
            );
          }
        }

        return Promise.reject(reason);
      });
    };

    /**
     * Config-specific merge-function which creates a new config-object
     * by merging two configuration objects together.
     *
     * @param {Object} config1
     * @param {Object} config2
     * @returns {Object} New object resulting from merging config2 to config1
     */
    var mergeConfig = function mergeConfig(config1, config2) {
      // eslint-disable-next-line no-param-reassign
      config2 = config2 || {};
      var config = {};

      var valueFromConfig2Keys = ['url', 'method', 'data'];
      var mergeDeepPropertiesKeys = ['headers', 'auth', 'proxy', 'params'];
      var defaultToConfig2Keys = [
        'baseURL', 'transformRequest', 'transformResponse', 'paramsSerializer',
        'timeout', 'timeoutMessage', 'withCredentials', 'adapter', 'responseType', 'xsrfCookieName',
        'xsrfHeaderName', 'onUploadProgress', 'onDownloadProgress', 'decompress',
        'maxContentLength', 'maxBodyLength', 'maxRedirects', 'transport', 'httpAgent',
        'httpsAgent', 'cancelToken', 'socketPath', 'responseEncoding'
      ];
      var directMergeKeys = ['validateStatus'];

      function getMergedValue(target, source) {
        if (utils.isPlainObject(target) && utils.isPlainObject(source)) {
          return utils.merge(target, source);
        } else if (utils.isPlainObject(source)) {
          return utils.merge({}, source);
        } else if (utils.isArray(source)) {
          return source.slice();
        }
        return source;
      }

      function mergeDeepProperties(prop) {
        if (!utils.isUndefined(config2[prop])) {
          config[prop] = getMergedValue(config1[prop], config2[prop]);
        } else if (!utils.isUndefined(config1[prop])) {
          config[prop] = getMergedValue(undefined, config1[prop]);
        }
      }

      utils.forEach(valueFromConfig2Keys, function valueFromConfig2(prop) {
        if (!utils.isUndefined(config2[prop])) {
          config[prop] = getMergedValue(undefined, config2[prop]);
        }
      });

      utils.forEach(mergeDeepPropertiesKeys, mergeDeepProperties);

      utils.forEach(defaultToConfig2Keys, function defaultToConfig2(prop) {
        if (!utils.isUndefined(config2[prop])) {
          config[prop] = getMergedValue(undefined, config2[prop]);
        } else if (!utils.isUndefined(config1[prop])) {
          config[prop] = getMergedValue(undefined, config1[prop]);
        }
      });

      utils.forEach(directMergeKeys, function merge(prop) {
        if (prop in config2) {
          config[prop] = getMergedValue(config1[prop], config2[prop]);
        } else if (prop in config1) {
          config[prop] = getMergedValue(undefined, config1[prop]);
        }
      });

      var axiosKeys = valueFromConfig2Keys
        .concat(mergeDeepPropertiesKeys)
        .concat(defaultToConfig2Keys)
        .concat(directMergeKeys);

      var otherKeys = Object
        .keys(config1)
        .concat(Object.keys(config2))
        .filter(function filterAxiosKeys(key) {
          return axiosKeys.indexOf(key) === -1;
        });

      utils.forEach(otherKeys, mergeDeepProperties);

      return config;
    };

    /**
     * Create a new instance of Axios
     *
     * @param {Object} instanceConfig The default config for the instance
     */
    function Axios(instanceConfig) {
      this.defaults = instanceConfig;
      this.interceptors = {
        request: new InterceptorManager_1(),
        response: new InterceptorManager_1()
      };
    }

    /**
     * Dispatch a request
     *
     * @param {Object} config The config specific for this request (merged with this.defaults)
     */
    Axios.prototype.request = function request(config) {
      /*eslint no-param-reassign:0*/
      // Allow for axios('example/url'[, config]) a la fetch API
      if (typeof config === 'string') {
        config = arguments[1] || {};
        config.url = arguments[0];
      } else {
        config = config || {};
      }

      config = mergeConfig(this.defaults, config);

      // Set config.method
      if (config.method) {
        config.method = config.method.toLowerCase();
      } else if (this.defaults.method) {
        config.method = this.defaults.method.toLowerCase();
      } else {
        config.method = 'get';
      }

      // Hook up interceptors middleware
      var chain = [dispatchRequest, undefined];
      var promise = Promise.resolve(config);

      this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
        chain.unshift(interceptor.fulfilled, interceptor.rejected);
      });

      this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
        chain.push(interceptor.fulfilled, interceptor.rejected);
      });

      while (chain.length) {
        promise = promise.then(chain.shift(), chain.shift());
      }

      return promise;
    };

    Axios.prototype.getUri = function getUri(config) {
      config = mergeConfig(this.defaults, config);
      return buildURL(config.url, config.params, config.paramsSerializer).replace(/^\?/, '');
    };

    // Provide aliases for supported request methods
    utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
      /*eslint func-names:0*/
      Axios.prototype[method] = function(url, config) {
        return this.request(mergeConfig(config || {}, {
          method: method,
          url: url,
          data: (config || {}).data
        }));
      };
    });

    utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
      /*eslint func-names:0*/
      Axios.prototype[method] = function(url, data, config) {
        return this.request(mergeConfig(config || {}, {
          method: method,
          url: url,
          data: data
        }));
      };
    });

    var Axios_1 = Axios;

    /**
     * A `Cancel` is an object that is thrown when an operation is canceled.
     *
     * @class
     * @param {string=} message The message.
     */
    function Cancel(message) {
      this.message = message;
    }

    Cancel.prototype.toString = function toString() {
      return 'Cancel' + (this.message ? ': ' + this.message : '');
    };

    Cancel.prototype.__CANCEL__ = true;

    var Cancel_1 = Cancel;

    /**
     * A `CancelToken` is an object that can be used to request cancellation of an operation.
     *
     * @class
     * @param {Function} executor The executor function.
     */
    function CancelToken(executor) {
      if (typeof executor !== 'function') {
        throw new TypeError('executor must be a function.');
      }

      var resolvePromise;
      this.promise = new Promise(function promiseExecutor(resolve) {
        resolvePromise = resolve;
      });

      var token = this;
      executor(function cancel(message) {
        if (token.reason) {
          // Cancellation has already been requested
          return;
        }

        token.reason = new Cancel_1(message);
        resolvePromise(token.reason);
      });
    }

    /**
     * Throws a `Cancel` if cancellation has been requested.
     */
    CancelToken.prototype.throwIfRequested = function throwIfRequested() {
      if (this.reason) {
        throw this.reason;
      }
    };

    /**
     * Returns an object that contains a new `CancelToken` and a function that, when called,
     * cancels the `CancelToken`.
     */
    CancelToken.source = function source() {
      var cancel;
      var token = new CancelToken(function executor(c) {
        cancel = c;
      });
      return {
        token: token,
        cancel: cancel
      };
    };

    var CancelToken_1 = CancelToken;

    /**
     * Syntactic sugar for invoking a function and expanding an array for arguments.
     *
     * Common use case would be to use `Function.prototype.apply`.
     *
     *  ```js
     *  function f(x, y, z) {}
     *  var args = [1, 2, 3];
     *  f.apply(null, args);
     *  ```
     *
     * With `spread` this example can be re-written.
     *
     *  ```js
     *  spread(function(x, y, z) {})([1, 2, 3]);
     *  ```
     *
     * @param {Function} callback
     * @returns {Function}
     */
    var spread = function spread(callback) {
      return function wrap(arr) {
        return callback.apply(null, arr);
      };
    };

    /**
     * Determines whether the payload is an error thrown by Axios
     *
     * @param {*} payload The value to test
     * @returns {boolean} True if the payload is an error thrown by Axios, otherwise false
     */
    var isAxiosError = function isAxiosError(payload) {
      return (typeof payload === 'object') && (payload.isAxiosError === true);
    };

    /**
     * Create an instance of Axios
     *
     * @param {Object} defaultConfig The default config for the instance
     * @return {Axios} A new instance of Axios
     */
    function createInstance(defaultConfig) {
      var context = new Axios_1(defaultConfig);
      var instance = bind(Axios_1.prototype.request, context);

      // Copy axios.prototype to instance
      utils.extend(instance, Axios_1.prototype, context);

      // Copy context to instance
      utils.extend(instance, context);

      return instance;
    }

    // Create the default instance to be exported
    var axios$1 = createInstance(defaults_1);

    // Expose Axios class to allow class inheritance
    axios$1.Axios = Axios_1;

    // Factory for creating new instances
    axios$1.create = function create(instanceConfig) {
      return createInstance(mergeConfig(axios$1.defaults, instanceConfig));
    };

    // Expose Cancel & CancelToken
    axios$1.Cancel = Cancel_1;
    axios$1.CancelToken = CancelToken_1;
    axios$1.isCancel = isCancel;

    // Expose all/spread
    axios$1.all = function all(promises) {
      return Promise.all(promises);
    };
    axios$1.spread = spread;

    // Expose isAxiosError
    axios$1.isAxiosError = isAxiosError;

    var axios_1 = axios$1;

    // Allow use of default import syntax in TypeScript
    var _default = axios$1;
    axios_1.default = _default;

    var axios = axios_1;

    importOrderCheck();
    var AlpineFetchMagicMethod = {
      start: function start() {
        checkForAlpine();
        Alpine.addMagicProperty('fetch', this.fetch.bind(null, null));
        Alpine.addMagicProperty('get', this.fetch.bind(null, 'get'));
        Alpine.addMagicProperty('post', this.fetch.bind(null, 'post'));
      },
      fetch: function fetch(method) {
        return async function (parameters, data) {
          if (data === void 0) {
            data = {};
          }

          function findResponse(response) {
            return Object.prototype.hasOwnProperty.call(response, 'data') ? response.data : response;
          } // Using $post or $get


          if (method) {
            var _axios;

            return await axios((_axios = {
              url: parameters,
              method: method
            }, _axios[method === 'post' ? 'data' : 'params'] = data, _axios)).then(function (response) {
              return findResponse(response);
            });
          }

          if (typeof parameters === 'string') {
            // Using $fetch('url')
            return await axios.get(parameters).then(function (response) {
              return findResponse(response);
            });
          } // Using $fetch({ // axios config })


          return await axios(parameters);
        };
      }
    };

    var alpine$8 = window.deferLoadingAlpine || function (alpine) {
      return alpine();
    };

    window.deferLoadingAlpine = function (callback) {
      AlpineFetchMagicMethod.start();
      alpine$8(callback);
    };

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

    var alpine$7 = window.deferLoadingAlpine || function (alpine) {
      return alpine();
    };

    window.deferLoadingAlpine = function (callback) {
      AlpineIntervalMagicMethod.start();
      alpine$7(callback);
    };

    importOrderCheck();
    var AlpineRangeMagicMethod = {
      start: function start() {
        checkForAlpine();
        Alpine.addMagicProperty('range', function () {
          return function (start, stop, step) {
            if (step === void 0) {
              step = 1;
            }

            // Accept $range(10) and expect 1...10
            if (typeof stop === 'undefined') {
              stop = start;
              start = start ? 1 : 0;
            } // Accept $range(20, 10) and expect 20...10


            var reverse = start > stop;

            if (reverse) {
              var _ref = [stop, start];
              start = _ref[0];
              stop = _ref[1];
            } // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from#Sequence_generator_range


            var range = Array.from({
              length: (stop - start) / step + 1
            }, function (_, i) {
              return start + i * step;
            });
            return reverse ? range.reverse() : range;
          };
        });
      }
    };

    var alpine$6 = window.deferLoadingAlpine || function (alpine) {
      return alpine();
    };

    window.deferLoadingAlpine = function (callback) {
      AlpineRangeMagicMethod.start();
      alpine$6(callback);
    };

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

    var alpine$5 = window.deferLoadingAlpine || function (alpine) {
      return alpine();
    };

    window.deferLoadingAlpine = function (callback) {
      AlpineRefreshMagicMethod.start();
      alpine$5(callback);
    };

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

    importOrderCheck(); // Collection of components that contains `$screen` helper usecase

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
        checkForAlpine(); // Bind `debouncedScreensUpdate` to resize event on window
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

    var alpine$4 = window.deferLoadingAlpine || function (alpine) {
      return alpine();
    };

    window.deferLoadingAlpine = function (callback) {
      AlpineScreenMagicMethod.start();
      alpine$4(callback);
    };

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function createCommonjsModule(fn) {
      var module = { exports: {} };
    	return fn(module, module.exports), module.exports;
    }

    /* smoothscroll v0.4.4 - 2019 - Dustan Kasten, Jeremias Menichelli - MIT License */

    var smoothscroll = createCommonjsModule(function (module, exports) {
    (function () {

      // polyfill
      function polyfill() {
        // aliases
        var w = window;
        var d = document;

        // return if scroll behavior is supported and polyfill is not forced
        if (
          'scrollBehavior' in d.documentElement.style &&
          w.__forceSmoothScrollPolyfill__ !== true
        ) {
          return;
        }

        // globals
        var Element = w.HTMLElement || w.Element;
        var SCROLL_TIME = 468;

        // object gathering original scroll methods
        var original = {
          scroll: w.scroll || w.scrollTo,
          scrollBy: w.scrollBy,
          elementScroll: Element.prototype.scroll || scrollElement,
          scrollIntoView: Element.prototype.scrollIntoView
        };

        // define timing method
        var now =
          w.performance && w.performance.now
            ? w.performance.now.bind(w.performance)
            : Date.now;

        /**
         * indicates if a the current browser is made by Microsoft
         * @method isMicrosoftBrowser
         * @param {String} userAgent
         * @returns {Boolean}
         */
        function isMicrosoftBrowser(userAgent) {
          var userAgentPatterns = ['MSIE ', 'Trident/', 'Edge/'];

          return new RegExp(userAgentPatterns.join('|')).test(userAgent);
        }

        /*
         * IE has rounding bug rounding down clientHeight and clientWidth and
         * rounding up scrollHeight and scrollWidth causing false positives
         * on hasScrollableSpace
         */
        var ROUNDING_TOLERANCE = isMicrosoftBrowser(w.navigator.userAgent) ? 1 : 0;

        /**
         * changes scroll position inside an element
         * @method scrollElement
         * @param {Number} x
         * @param {Number} y
         * @returns {undefined}
         */
        function scrollElement(x, y) {
          this.scrollLeft = x;
          this.scrollTop = y;
        }

        /**
         * returns result of applying ease math function to a number
         * @method ease
         * @param {Number} k
         * @returns {Number}
         */
        function ease(k) {
          return 0.5 * (1 - Math.cos(Math.PI * k));
        }

        /**
         * indicates if a smooth behavior should be applied
         * @method shouldBailOut
         * @param {Number|Object} firstArg
         * @returns {Boolean}
         */
        function shouldBailOut(firstArg) {
          if (
            firstArg === null ||
            typeof firstArg !== 'object' ||
            firstArg.behavior === undefined ||
            firstArg.behavior === 'auto' ||
            firstArg.behavior === 'instant'
          ) {
            // first argument is not an object/null
            // or behavior is auto, instant or undefined
            return true;
          }

          if (typeof firstArg === 'object' && firstArg.behavior === 'smooth') {
            // first argument is an object and behavior is smooth
            return false;
          }

          // throw error when behavior is not supported
          throw new TypeError(
            'behavior member of ScrollOptions ' +
              firstArg.behavior +
              ' is not a valid value for enumeration ScrollBehavior.'
          );
        }

        /**
         * indicates if an element has scrollable space in the provided axis
         * @method hasScrollableSpace
         * @param {Node} el
         * @param {String} axis
         * @returns {Boolean}
         */
        function hasScrollableSpace(el, axis) {
          if (axis === 'Y') {
            return el.clientHeight + ROUNDING_TOLERANCE < el.scrollHeight;
          }

          if (axis === 'X') {
            return el.clientWidth + ROUNDING_TOLERANCE < el.scrollWidth;
          }
        }

        /**
         * indicates if an element has a scrollable overflow property in the axis
         * @method canOverflow
         * @param {Node} el
         * @param {String} axis
         * @returns {Boolean}
         */
        function canOverflow(el, axis) {
          var overflowValue = w.getComputedStyle(el, null)['overflow' + axis];

          return overflowValue === 'auto' || overflowValue === 'scroll';
        }

        /**
         * indicates if an element can be scrolled in either axis
         * @method isScrollable
         * @param {Node} el
         * @param {String} axis
         * @returns {Boolean}
         */
        function isScrollable(el) {
          var isScrollableY = hasScrollableSpace(el, 'Y') && canOverflow(el, 'Y');
          var isScrollableX = hasScrollableSpace(el, 'X') && canOverflow(el, 'X');

          return isScrollableY || isScrollableX;
        }

        /**
         * finds scrollable parent of an element
         * @method findScrollableParent
         * @param {Node} el
         * @returns {Node} el
         */
        function findScrollableParent(el) {
          while (el !== d.body && isScrollable(el) === false) {
            el = el.parentNode || el.host;
          }

          return el;
        }

        /**
         * self invoked function that, given a context, steps through scrolling
         * @method step
         * @param {Object} context
         * @returns {undefined}
         */
        function step(context) {
          var time = now();
          var value;
          var currentX;
          var currentY;
          var elapsed = (time - context.startTime) / SCROLL_TIME;

          // avoid elapsed times higher than one
          elapsed = elapsed > 1 ? 1 : elapsed;

          // apply easing to elapsed time
          value = ease(elapsed);

          currentX = context.startX + (context.x - context.startX) * value;
          currentY = context.startY + (context.y - context.startY) * value;

          context.method.call(context.scrollable, currentX, currentY);

          // scroll more if we have not reached our destination
          if (currentX !== context.x || currentY !== context.y) {
            w.requestAnimationFrame(step.bind(w, context));
          }
        }

        /**
         * scrolls window or element with a smooth behavior
         * @method smoothScroll
         * @param {Object|Node} el
         * @param {Number} x
         * @param {Number} y
         * @returns {undefined}
         */
        function smoothScroll(el, x, y) {
          var scrollable;
          var startX;
          var startY;
          var method;
          var startTime = now();

          // define scroll context
          if (el === d.body) {
            scrollable = w;
            startX = w.scrollX || w.pageXOffset;
            startY = w.scrollY || w.pageYOffset;
            method = original.scroll;
          } else {
            scrollable = el;
            startX = el.scrollLeft;
            startY = el.scrollTop;
            method = scrollElement;
          }

          // scroll looping over a frame
          step({
            scrollable: scrollable,
            method: method,
            startTime: startTime,
            startX: startX,
            startY: startY,
            x: x,
            y: y
          });
        }

        // ORIGINAL METHODS OVERRIDES
        // w.scroll and w.scrollTo
        w.scroll = w.scrollTo = function() {
          // avoid action when no arguments are passed
          if (arguments[0] === undefined) {
            return;
          }

          // avoid smooth behavior if not required
          if (shouldBailOut(arguments[0]) === true) {
            original.scroll.call(
              w,
              arguments[0].left !== undefined
                ? arguments[0].left
                : typeof arguments[0] !== 'object'
                  ? arguments[0]
                  : w.scrollX || w.pageXOffset,
              // use top prop, second argument if present or fallback to scrollY
              arguments[0].top !== undefined
                ? arguments[0].top
                : arguments[1] !== undefined
                  ? arguments[1]
                  : w.scrollY || w.pageYOffset
            );

            return;
          }

          // LET THE SMOOTHNESS BEGIN!
          smoothScroll.call(
            w,
            d.body,
            arguments[0].left !== undefined
              ? ~~arguments[0].left
              : w.scrollX || w.pageXOffset,
            arguments[0].top !== undefined
              ? ~~arguments[0].top
              : w.scrollY || w.pageYOffset
          );
        };

        // w.scrollBy
        w.scrollBy = function() {
          // avoid action when no arguments are passed
          if (arguments[0] === undefined) {
            return;
          }

          // avoid smooth behavior if not required
          if (shouldBailOut(arguments[0])) {
            original.scrollBy.call(
              w,
              arguments[0].left !== undefined
                ? arguments[0].left
                : typeof arguments[0] !== 'object' ? arguments[0] : 0,
              arguments[0].top !== undefined
                ? arguments[0].top
                : arguments[1] !== undefined ? arguments[1] : 0
            );

            return;
          }

          // LET THE SMOOTHNESS BEGIN!
          smoothScroll.call(
            w,
            d.body,
            ~~arguments[0].left + (w.scrollX || w.pageXOffset),
            ~~arguments[0].top + (w.scrollY || w.pageYOffset)
          );
        };

        // Element.prototype.scroll and Element.prototype.scrollTo
        Element.prototype.scroll = Element.prototype.scrollTo = function() {
          // avoid action when no arguments are passed
          if (arguments[0] === undefined) {
            return;
          }

          // avoid smooth behavior if not required
          if (shouldBailOut(arguments[0]) === true) {
            // if one number is passed, throw error to match Firefox implementation
            if (typeof arguments[0] === 'number' && arguments[1] === undefined) {
              throw new SyntaxError('Value could not be converted');
            }

            original.elementScroll.call(
              this,
              // use left prop, first number argument or fallback to scrollLeft
              arguments[0].left !== undefined
                ? ~~arguments[0].left
                : typeof arguments[0] !== 'object' ? ~~arguments[0] : this.scrollLeft,
              // use top prop, second argument or fallback to scrollTop
              arguments[0].top !== undefined
                ? ~~arguments[0].top
                : arguments[1] !== undefined ? ~~arguments[1] : this.scrollTop
            );

            return;
          }

          var left = arguments[0].left;
          var top = arguments[0].top;

          // LET THE SMOOTHNESS BEGIN!
          smoothScroll.call(
            this,
            this,
            typeof left === 'undefined' ? this.scrollLeft : ~~left,
            typeof top === 'undefined' ? this.scrollTop : ~~top
          );
        };

        // Element.prototype.scrollBy
        Element.prototype.scrollBy = function() {
          // avoid action when no arguments are passed
          if (arguments[0] === undefined) {
            return;
          }

          // avoid smooth behavior if not required
          if (shouldBailOut(arguments[0]) === true) {
            original.elementScroll.call(
              this,
              arguments[0].left !== undefined
                ? ~~arguments[0].left + this.scrollLeft
                : ~~arguments[0] + this.scrollLeft,
              arguments[0].top !== undefined
                ? ~~arguments[0].top + this.scrollTop
                : ~~arguments[1] + this.scrollTop
            );

            return;
          }

          this.scroll({
            left: ~~arguments[0].left + this.scrollLeft,
            top: ~~arguments[0].top + this.scrollTop,
            behavior: arguments[0].behavior
          });
        };

        // Element.prototype.scrollIntoView
        Element.prototype.scrollIntoView = function() {
          // avoid smooth behavior if not required
          if (shouldBailOut(arguments[0]) === true) {
            original.scrollIntoView.call(
              this,
              arguments[0] === undefined ? true : arguments[0]
            );

            return;
          }

          // LET THE SMOOTHNESS BEGIN!
          var scrollableParent = findScrollableParent(this);
          var parentRects = scrollableParent.getBoundingClientRect();
          var clientRects = this.getBoundingClientRect();

          if (scrollableParent !== d.body) {
            // reveal element inside parent
            smoothScroll.call(
              this,
              scrollableParent,
              scrollableParent.scrollLeft + clientRects.left - parentRects.left,
              scrollableParent.scrollTop + clientRects.top - parentRects.top
            );

            // reveal parent in viewport unless is fixed
            if (w.getComputedStyle(scrollableParent).position !== 'fixed') {
              w.scrollBy({
                left: parentRects.left,
                top: parentRects.top,
                behavior: 'smooth'
              });
            }
          } else {
            // reveal element in viewport
            w.scrollBy({
              left: clientRects.left,
              top: clientRects.top,
              behavior: 'smooth'
            });
          }
        };
      }

      {
        // commonjs
        module.exports = { polyfill: polyfill };
      }

    }());
    });

    importOrderCheck();
    smoothscroll.polyfill();
    var AlpineScrollMagicMethod = {
      start: function start() {
        checkForAlpine();
        Alpine.addMagicProperty('scroll', function () {
          return function (target, options) {
            if (options === void 0) {
              options = {};
            }

            var originalTarget = target; // Check if we specified an offset

            var offset = options.offset ? parseInt(options.offset, 10) : 0;
            delete options.offset; // Support integers specified as strings
            // We do a strict check first because we don't whant to support things like "100foo"

            if (typeof target === 'string' && /^[0-9]+?/g.test(target)) {
              target = parseInt(target, 10);
            } // Support for CSS query selector


            if (typeof target === 'string') {
              target = document.querySelector(target);
            } // If we got an element, get the y coordinate relative to the document
            // This could happens if we trasform a selector or if we pass an Element in,
            // for example using $ref['something']


            if (target instanceof Element) {
              target = Math.floor(target.getBoundingClientRect().top + window.pageYOffset);
            } // If target has been converted to the y coordinate or was an object to begin with
            // we transform it to a ScrollToOptions dictionary


            if (Number.isInteger(target)) {
              target = {
                top: target - offset,
                behavior: 'smooth' // default to smooth

              };
            } // At this point target should be either be converted to a ScrollToOptions dictionary
            // or should have been an object to begin with. If it isn't, it's time to give up.


            if (typeof target !== 'object') {
              throw Error('Unsupported $scroll target: ', originalTarget);
            } // Override the dictionary with the options passed as second params


            Object.assign(target, options); // Let's scroll eventually

            window.scroll(target);
          };
        });
      }
    };

    var alpine$3 = window.deferLoadingAlpine || function (alpine) {
      return alpine();
    };

    window.deferLoadingAlpine = function (callback) {
      AlpineScrollMagicMethod.start();
      alpine$3(callback);
    };

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

    var alpine$2 = window.deferLoadingAlpine || function (alpine) {
      return alpine();
    };

    window.deferLoadingAlpine = function (callback) {
      AlpineTruncateMagicMethod.start();
      alpine$2(callback);
    };

    var deepDiff = createCommonjsModule(function (module, exports) {
    (function(root, factory) { // eslint-disable-line no-extra-semi
      var deepDiff = factory(root);
      // eslint-disable-next-line no-undef
      {
          // Node.js or ReactNative
          module.exports = deepDiff;
      }
    }(commonjsGlobal, function(root) {
      var validKinds = ['N', 'E', 'A', 'D'];

      // nodejs compatible on server side and in the browser.
      function inherits(ctor, superCtor) {
        ctor.super_ = superCtor;
        ctor.prototype = Object.create(superCtor.prototype, {
          constructor: {
            value: ctor,
            enumerable: false,
            writable: true,
            configurable: true
          }
        });
      }

      function Diff(kind, path) {
        Object.defineProperty(this, 'kind', {
          value: kind,
          enumerable: true
        });
        if (path && path.length) {
          Object.defineProperty(this, 'path', {
            value: path,
            enumerable: true
          });
        }
      }

      function DiffEdit(path, origin, value) {
        DiffEdit.super_.call(this, 'E', path);
        Object.defineProperty(this, 'lhs', {
          value: origin,
          enumerable: true
        });
        Object.defineProperty(this, 'rhs', {
          value: value,
          enumerable: true
        });
      }
      inherits(DiffEdit, Diff);

      function DiffNew(path, value) {
        DiffNew.super_.call(this, 'N', path);
        Object.defineProperty(this, 'rhs', {
          value: value,
          enumerable: true
        });
      }
      inherits(DiffNew, Diff);

      function DiffDeleted(path, value) {
        DiffDeleted.super_.call(this, 'D', path);
        Object.defineProperty(this, 'lhs', {
          value: value,
          enumerable: true
        });
      }
      inherits(DiffDeleted, Diff);

      function DiffArray(path, index, item) {
        DiffArray.super_.call(this, 'A', path);
        Object.defineProperty(this, 'index', {
          value: index,
          enumerable: true
        });
        Object.defineProperty(this, 'item', {
          value: item,
          enumerable: true
        });
      }
      inherits(DiffArray, Diff);

      function arrayRemove(arr, from, to) {
        var rest = arr.slice((to || from) + 1 || arr.length);
        arr.length = from < 0 ? arr.length + from : from;
        arr.push.apply(arr, rest);
        return arr;
      }

      function realTypeOf(subject) {
        var type = typeof subject;
        if (type !== 'object') {
          return type;
        }

        if (subject === Math) {
          return 'math';
        } else if (subject === null) {
          return 'null';
        } else if (Array.isArray(subject)) {
          return 'array';
        } else if (Object.prototype.toString.call(subject) === '[object Date]') {
          return 'date';
        } else if (typeof subject.toString === 'function' && /^\/.*\//.test(subject.toString())) {
          return 'regexp';
        }
        return 'object';
      }

      // http://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/
      function hashThisString(string) {
        var hash = 0;
        if (string.length === 0) { return hash; }
        for (var i = 0; i < string.length; i++) {
          var char = string.charCodeAt(i);
          hash = ((hash << 5) - hash) + char;
          hash = hash & hash; // Convert to 32bit integer
        }
        return hash;
      }

      // Gets a hash of the given object in an array order-independent fashion
      // also object key order independent (easier since they can be alphabetized)
      function getOrderIndependentHash(object) {
        var accum = 0;
        var type = realTypeOf(object);

        if (type === 'array') {
          object.forEach(function (item) {
            // Addition is commutative so this is order indep
            accum += getOrderIndependentHash(item);
          });

          var arrayString = '[type: array, hash: ' + accum + ']';
          return accum + hashThisString(arrayString);
        }

        if (type === 'object') {
          for (var key in object) {
            if (object.hasOwnProperty(key)) {
              var keyValueString = '[ type: object, key: ' + key + ', value hash: ' + getOrderIndependentHash(object[key]) + ']';
              accum += hashThisString(keyValueString);
            }
          }

          return accum;
        }

        // Non object, non array...should be good?
        var stringToHash = '[ type: ' + type + ' ; value: ' + object + ']';
        return accum + hashThisString(stringToHash);
      }

      function deepDiff(lhs, rhs, changes, prefilter, path, key, stack, orderIndependent) {
        changes = changes || [];
        path = path || [];
        stack = stack || [];
        var currentPath = path.slice(0);
        if (typeof key !== 'undefined' && key !== null) {
          if (prefilter) {
            if (typeof (prefilter) === 'function' && prefilter(currentPath, key)) {
              return;
            } else if (typeof (prefilter) === 'object') {
              if (prefilter.prefilter && prefilter.prefilter(currentPath, key)) {
                return;
              }
              if (prefilter.normalize) {
                var alt = prefilter.normalize(currentPath, key, lhs, rhs);
                if (alt) {
                  lhs = alt[0];
                  rhs = alt[1];
                }
              }
            }
          }
          currentPath.push(key);
        }

        // Use string comparison for regexes
        if (realTypeOf(lhs) === 'regexp' && realTypeOf(rhs) === 'regexp') {
          lhs = lhs.toString();
          rhs = rhs.toString();
        }

        var ltype = typeof lhs;
        var rtype = typeof rhs;
        var i, j, k, other;

        var ldefined = ltype !== 'undefined' ||
          (stack && (stack.length > 0) && stack[stack.length - 1].lhs &&
            Object.getOwnPropertyDescriptor(stack[stack.length - 1].lhs, key));
        var rdefined = rtype !== 'undefined' ||
          (stack && (stack.length > 0) && stack[stack.length - 1].rhs &&
            Object.getOwnPropertyDescriptor(stack[stack.length - 1].rhs, key));

        if (!ldefined && rdefined) {
          changes.push(new DiffNew(currentPath, rhs));
        } else if (!rdefined && ldefined) {
          changes.push(new DiffDeleted(currentPath, lhs));
        } else if (realTypeOf(lhs) !== realTypeOf(rhs)) {
          changes.push(new DiffEdit(currentPath, lhs, rhs));
        } else if (realTypeOf(lhs) === 'date' && (lhs - rhs) !== 0) {
          changes.push(new DiffEdit(currentPath, lhs, rhs));
        } else if (ltype === 'object' && lhs !== null && rhs !== null) {
          for (i = stack.length - 1; i > -1; --i) {
            if (stack[i].lhs === lhs) {
              other = true;
              break;
            }
          }
          if (!other) {
            stack.push({ lhs: lhs, rhs: rhs });
            if (Array.isArray(lhs)) {
              // If order doesn't matter, we need to sort our arrays
              if (orderIndependent) {
                lhs.sort(function (a, b) {
                  return getOrderIndependentHash(a) - getOrderIndependentHash(b);
                });

                rhs.sort(function (a, b) {
                  return getOrderIndependentHash(a) - getOrderIndependentHash(b);
                });
              }
              i = rhs.length - 1;
              j = lhs.length - 1;
              while (i > j) {
                changes.push(new DiffArray(currentPath, i, new DiffNew(undefined, rhs[i--])));
              }
              while (j > i) {
                changes.push(new DiffArray(currentPath, j, new DiffDeleted(undefined, lhs[j--])));
              }
              for (; i >= 0; --i) {
                deepDiff(lhs[i], rhs[i], changes, prefilter, currentPath, i, stack, orderIndependent);
              }
            } else {
              var akeys = Object.keys(lhs);
              var pkeys = Object.keys(rhs);
              for (i = 0; i < akeys.length; ++i) {
                k = akeys[i];
                other = pkeys.indexOf(k);
                if (other >= 0) {
                  deepDiff(lhs[k], rhs[k], changes, prefilter, currentPath, k, stack, orderIndependent);
                  pkeys[other] = null;
                } else {
                  deepDiff(lhs[k], undefined, changes, prefilter, currentPath, k, stack, orderIndependent);
                }
              }
              for (i = 0; i < pkeys.length; ++i) {
                k = pkeys[i];
                if (k) {
                  deepDiff(undefined, rhs[k], changes, prefilter, currentPath, k, stack, orderIndependent);
                }
              }
            }
            stack.length = stack.length - 1;
          } else if (lhs !== rhs) {
            // lhs is contains a cycle at this element and it differs from rhs
            changes.push(new DiffEdit(currentPath, lhs, rhs));
          }
        } else if (lhs !== rhs) {
          if (!(ltype === 'number' && isNaN(lhs) && isNaN(rhs))) {
            changes.push(new DiffEdit(currentPath, lhs, rhs));
          }
        }
      }

      function observableDiff(lhs, rhs, observer, prefilter, orderIndependent) {
        var changes = [];
        deepDiff(lhs, rhs, changes, prefilter, null, null, null, orderIndependent);
        if (observer) {
          for (var i = 0; i < changes.length; ++i) {
            observer(changes[i]);
          }
        }
        return changes;
      }

      function orderIndependentDeepDiff(lhs, rhs, changes, prefilter, path, key, stack) {
        return deepDiff(lhs, rhs, changes, prefilter, path, key, stack, true);
      }

      function accumulateDiff(lhs, rhs, prefilter, accum) {
        var observer = (accum) ?
          function (difference) {
            if (difference) {
              accum.push(difference);
            }
          } : undefined;
        var changes = observableDiff(lhs, rhs, observer, prefilter);
        return (accum) ? accum : (changes.length) ? changes : undefined;
      }

      function accumulateOrderIndependentDiff(lhs, rhs, prefilter, accum) {
        var observer = (accum) ?
          function (difference) {
            if (difference) {
              accum.push(difference);
            }
          } : undefined;
        var changes = observableDiff(lhs, rhs, observer, prefilter, true);
        return (accum) ? accum : (changes.length) ? changes : undefined;
      }

      function applyArrayChange(arr, index, change) {
        if (change.path && change.path.length) {
          var it = arr[index],
            i, u = change.path.length - 1;
          for (i = 0; i < u; i++) {
            it = it[change.path[i]];
          }
          switch (change.kind) {
            case 'A':
              applyArrayChange(it[change.path[i]], change.index, change.item);
              break;
            case 'D':
              delete it[change.path[i]];
              break;
            case 'E':
            case 'N':
              it[change.path[i]] = change.rhs;
              break;
          }
        } else {
          switch (change.kind) {
            case 'A':
              applyArrayChange(arr[index], change.index, change.item);
              break;
            case 'D':
              arr = arrayRemove(arr, index);
              break;
            case 'E':
            case 'N':
              arr[index] = change.rhs;
              break;
          }
        }
        return arr;
      }

      function applyChange(target, source, change) {
        if (typeof change === 'undefined' && source && ~validKinds.indexOf(source.kind)) {
          change = source;
        }
        if (target && change && change.kind) {
          var it = target,
            i = -1,
            last = change.path ? change.path.length - 1 : 0;
          while (++i < last) {
            if (typeof it[change.path[i]] === 'undefined') {
              it[change.path[i]] = (typeof change.path[i + 1] !== 'undefined' && typeof change.path[i + 1] === 'number') ? [] : {};
            }
            it = it[change.path[i]];
          }
          switch (change.kind) {
            case 'A':
              if (change.path && typeof it[change.path[i]] === 'undefined') {
                it[change.path[i]] = [];
              }
              applyArrayChange(change.path ? it[change.path[i]] : it, change.index, change.item);
              break;
            case 'D':
              delete it[change.path[i]];
              break;
            case 'E':
            case 'N':
              it[change.path[i]] = change.rhs;
              break;
          }
        }
      }

      function revertArrayChange(arr, index, change) {
        if (change.path && change.path.length) {
          // the structure of the object at the index has changed...
          var it = arr[index],
            i, u = change.path.length - 1;
          for (i = 0; i < u; i++) {
            it = it[change.path[i]];
          }
          switch (change.kind) {
            case 'A':
              revertArrayChange(it[change.path[i]], change.index, change.item);
              break;
            case 'D':
              it[change.path[i]] = change.lhs;
              break;
            case 'E':
              it[change.path[i]] = change.lhs;
              break;
            case 'N':
              delete it[change.path[i]];
              break;
          }
        } else {
          // the array item is different...
          switch (change.kind) {
            case 'A':
              revertArrayChange(arr[index], change.index, change.item);
              break;
            case 'D':
              arr[index] = change.lhs;
              break;
            case 'E':
              arr[index] = change.lhs;
              break;
            case 'N':
              arr = arrayRemove(arr, index);
              break;
          }
        }
        return arr;
      }

      function revertChange(target, source, change) {
        if (target && source && change && change.kind) {
          var it = target,
            i, u;
          u = change.path.length - 1;
          for (i = 0; i < u; i++) {
            if (typeof it[change.path[i]] === 'undefined') {
              it[change.path[i]] = {};
            }
            it = it[change.path[i]];
          }
          switch (change.kind) {
            case 'A':
              // Array was modified...
              // it will be an array...
              revertArrayChange(it[change.path[i]], change.index, change.item);
              break;
            case 'D':
              // Item was deleted...
              it[change.path[i]] = change.lhs;
              break;
            case 'E':
              // Item was edited...
              it[change.path[i]] = change.lhs;
              break;
            case 'N':
              // Item is new...
              delete it[change.path[i]];
              break;
          }
        }
      }

      function applyDiff(target, source, filter) {
        if (target && source) {
          var onChange = function (change) {
            if (!filter || filter(target, source, change)) {
              applyChange(target, source, change);
            }
          };
          observableDiff(target, source, onChange);
        }
      }

      Object.defineProperties(accumulateDiff, {

        diff: {
          value: accumulateDiff,
          enumerable: true
        },
        orderIndependentDiff: {
          value: accumulateOrderIndependentDiff,
          enumerable: true
        },
        observableDiff: {
          value: observableDiff,
          enumerable: true
        },
        orderIndependentObservableDiff: {
          value: orderIndependentDeepDiff,
          enumerable: true
        },
        orderIndepHash: {
          value: getOrderIndependentHash,
          enumerable: true
        },
        applyDiff: {
          value: applyDiff,
          enumerable: true
        },
        applyChange: {
          value: applyChange,
          enumerable: true
        },
        revertChange: {
          value: revertChange,
          enumerable: true
        },
        isConflict: {
          value: function () {
            return typeof $conflict !== 'undefined';
          },
          enumerable: true
        }
      });

      // hackish...
      accumulateDiff.DeepDiff = accumulateDiff;
      // ...but works with:
      // import DeepDiff from 'deep-diff'
      // import { DeepDiff } from 'deep-diff'
      // const DeepDiff = require('deep-diff');
      // const { DeepDiff } = require('deep-diff');

      if (root) {
        root.DeepDiff = accumulateDiff;
      }

      return accumulateDiff;
    }));
    });

    importOrderCheck();
    var history = new WeakMap();
    var AlpineUndoMagicMethod = {
      start: function start() {
        var _this = this;

        checkForAlpine();
        Alpine.addMagicProperty('track', function ($el) {
          return function (propertiesToWatch) {
            var _propertiesToWatch;

            propertiesToWatch = (_propertiesToWatch = propertiesToWatch) != null ? _propertiesToWatch : Object.keys(componentData($el));
            propertiesToWatch = Array.isArray(propertiesToWatch) ? propertiesToWatch : [propertiesToWatch];
            var initialState = JSON.stringify(componentData($el, propertiesToWatch));
            updateOnMutation($el, function () {
              history.has($el.__x) || _this.store($el.__x, {
                props: propertiesToWatch,
                previous: initialState
              });
              var fresh = componentData($el, history.get($el.__x).props);
              var previous = JSON.parse(history.get($el.__x).previous);
              var changes = deepDiff.DeepDiff.diff(previous, fresh, true);

              if (changes && changes.length) {
                changes = changes.filter(function (change) {
                  return history.get($el.__x).props.some(function (prop) {
                    return change.path.join('.').startsWith(prop);
                  });
                });
                history.get($el.__x).previous = JSON.stringify(fresh);
                history.get($el.__x).changes.push(changes);

                $el.__x.updateElements($el);
              }
            });
          };
        });
        Alpine.addMagicProperty('undo', function ($el, $clone) {
          return function () {
            if ($el !== $clone) {
              $el = _this.syncClone($el, $clone);
            }

            var changes = history.get($el.__x).changes.pop();
            var previous = JSON.parse(history.get($el.__x).previous);
            changes && changes.forEach(function (change) {
              deepDiff.DeepDiff.revertChange(previous, componentData($el, history.get($el.__x).props), change);
            }); // This could probably be extracted to a utility method like updateComponentProperties()

            if (Object.keys(previous).length) {
              var newData = {};
              Object.entries(previous).forEach(function (item) {
                newData[item[0]] = item[1];
              });
              $el.__x.$data = Object.assign($el.__x.$data, newData);
            }

            history.get($el.__x).previous = JSON.stringify(componentData($el, history.get($el.__x).props));
          };
        });
        Alpine.addMagicProperty('history', function ($el, $clone) {
          if (!$clone.__x) return [];

          if ($el !== $clone) {
            $el = _this.syncClone($el, $clone);
          }

          return history.has($el.__x) ? history.get($el.__x) : [];
        });
      },
      store: function store(key, state) {
        history.set(key, Object.assign({
          changes: [],

          get length() {
            return this.changes.length;
          }

        }, state));
        return history.get(key);
      },
      syncClone: function syncClone($el, $clone) {
        this.store($clone.__x, {
          props: history.get($el.__x).props,
          previous: history.get($el.__x).previous,
          changes: history.get($el.__x).changes
        });
        return $clone;
      }
    };

    var alpine$1 = window.deferLoadingAlpine || function (alpine) {
      return alpine();
    };

    window.deferLoadingAlpine = function (callback) {
      alpine$1(callback);
      AlpineUndoMagicMethod.start();
    };

    importOrderCheck();
    var DIRECTIVE = 'unsafe-html';

    var nodeScriptClone = function nodeScriptClone(node) {
      var script = document.createElement('script');
      script.text = node.innerHTML;

      for (var i = 0; i < node.attributes.length; i++) {
        var attr = node.attributes[i];
        script.setAttribute(attr.name, attr.value);
      }

      return script;
    };

    var nodeScriptReplace = function nodeScriptReplace(node) {
      if (node.tagName && node.tagName.toLowerCase() === 'script') {
        node.parentNode.replaceChild(nodeScriptClone(node), node);
      } else {
        for (var i = 0; i < node.childNodes.length; i++) {
          nodeScriptReplace(node.childNodes[i]);
        }
      }

      return node;
    };

    var AlpineUnsafeHTMLCustomDirective = {
      start: function start() {
        checkForAlpine();
        Alpine.onBeforeComponentInitialized(function (component) {
          var legacyResolveBoundAttributes = component.resolveBoundAttributes;

          component.resolveBoundAttributes = function (el, initialUpdate, extraVars) {
            if (initialUpdate === void 0) {
              initialUpdate = false;
            }

            var attrs = getXDirectives(el);
            attrs.forEach(function (_ref) {
              var type = _ref.type,
                  expression = _ref.expression;

              if (type === DIRECTIVE) {
                el.innerHTML = component.evaluateReturnExpression(el, expression, extraVars);
                nodeScriptReplace(el);
              }
            });
            return legacyResolveBoundAttributes.bind(component)(el, initialUpdate, extraVars);
          };
        });
      }
    };

    var alpine = window.deferLoadingAlpine || function (alpine) {
      return alpine();
    };

    window.deferLoadingAlpine = function (callback) {
      AlpineUnsafeHTMLCustomDirective.start();
      alpine(callback);
    };

    var index = {
      AlpineComponentMagicMethod: AlpineComponentMagicMethod,
      AlpineFetchMagicMethod: AlpineFetchMagicMethod,
      AlpineIntervalMagicMethod: AlpineIntervalMagicMethod,
      AlpineRangeMagicMethod: AlpineRangeMagicMethod,
      AlpineRefreshMagicMethod: AlpineRefreshMagicMethod,
      AlpineScreenMagicMethod: AlpineScreenMagicMethod,
      AlpineScrollMagicMethod: AlpineScrollMagicMethod,
      AlpineTruncateMagicMethod: AlpineTruncateMagicMethod,
      AlpineUndoMagicMethod: AlpineUndoMagicMethod,
      AlpineUnsafeHTMLCustomDirective: AlpineUnsafeHTMLCustomDirective
    };

    return index;

})));
