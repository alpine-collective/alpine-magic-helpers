(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.undo = factory());
}(this, (function () { 'use strict';

    var checkForAlpine = function checkForAlpine() {
      if (!window.Alpine) {
        throw new Error('[Magic Helpers] Alpine is required for the magic helpers to function correctly.');
      }

      if (!window.Alpine.version || !isValidVersion('2.5.0', window.Alpine.version)) {
        throw new Error('Invalid Alpine version. Please use Alpine version 2.5.0 or above');
      }
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
        characterData: true,
        subtree: true
      });
    }; // Borrowed from https://stackoverflow.com/a/54733755/1437789

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
    }

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function createCommonjsModule(fn, basedir, module) {
    	return module = {
    		path: basedir,
    		exports: {},
    		require: function (path, base) {
    			return commonjsRequire();
    		}
    	}, fn(module, module.exports), module.exports;
    }

    function commonjsRequire () {
    	throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
    }

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

    var AlpineUndoMagicMethod = {
      start: function start() {
        checkForAlpine();
        Alpine.addMagicProperty('history', function ($el) {
          if ($el.__x) {
            var _$el$__x$$data$__xc;

            $el.__x.$data.__xc = (_$el$__x$$data$__xc = $el.__x.$data.__xc) != null ? _$el$__x$$data$__xc : {};
            return $el.__x.$data.__xc.history.length ? $el.__x.$data.__xc.history : [];
          }

          return [];
        });
        Alpine.addMagicProperty('track', function ($el) {
          return function (propertiesToWatch) {
            var _$el$__xc, _propertiesToWatch;

            $el.__xc = (_$el$__xc = $el.__xc) != null ? _$el$__xc : {};
            propertiesToWatch = (_propertiesToWatch = propertiesToWatch) != null ? _propertiesToWatch : Object.keys(componentData($el)); // These are computed on load once, so won't last when Alpine.clone() is called

            propertiesToWatch = Array.isArray(propertiesToWatch) ? propertiesToWatch : [propertiesToWatch];
            $el.__xc.propertiesBeingWatched = propertiesToWatch.filter(function (key) {
              return key !== '__xc';
            });
            $el.__xc.initialComponentState = componentData($el, $el.__xc.propertiesBeingWatched);
            $el.__xc.previousComponentState = JSON.stringify($el.__xc.initialComponentState);
            updateOnMutation($el, function () {
              preserveState($el);
              var previous = JSON.parse($el.__x.$data.__xc.previousComponentState);
              var fresh = JSON.parse(JSON.stringify(componentData($el, $el.__x.$data.__xc.propertiesBeingWatched)));
              var changes = deepDiff.DeepDiff.diff(previous, fresh, true);
              changes = changes ? changes.filter(function (change) {
                // Filter down to the properties we want (top level only)
                return $el.__x.$data.__xc.propertiesBeingWatched.some(function (prop) {
                  return change.path.join('.').startsWith(prop);
                });
              }) : [];

              if (changes.length) {
                $el.__x.$data.__xc.history.push(changes);

                $el.__x.$data.__xc.previousComponentState = JSON.stringify(fresh);

                $el.__x.updateElements($el);
              }
            });
          }; // If this isn't setup the information will get lost on Alpine.clone()

          function preserveState($el) {
            var _$el$__x$$data$__xc2;

            $el.__x.$data.__xc = (_$el$__x$$data$__xc2 = $el.__x.$data.__xc) != null ? _$el$__x$$data$__xc2 : {};

            if (typeof $el.__x.$data.__xc.history === 'undefined') {
              $el.__x.$data.__xc.history = [];
            }

            if (typeof $el.__x.$data.__xc.initialComponentState === 'undefined') {
              $el.__x.$data.__xc.initialComponentState = $el.__xc.initialComponentState;
            }

            if (typeof $el.__x.$data.__xc.previousComponentState === 'undefined') {
              $el.__x.$data.__xc.previousComponentState = $el.__xc.previousComponentState;
            }

            if (typeof $el.__x.$data.__xc.propertiesBeingWatched === 'undefined') {
              $el.__x.$data.__xc.propertiesBeingWatched = $el.__xc.propertiesBeingWatched;
            }
          }
        });
        Alpine.addMagicProperty('undo', function ($el) {
          return function () {
            var _fresh;

            var diffs = $el.__x.$data.__xc.history.pop();

            var fresh = JSON.parse($el.__x.$data.__xc.previousComponentState);
            fresh = (_fresh = fresh) != null ? _fresh : $el.__x.$data.__xc.initialComponentState;
            diffs && diffs.forEach(function (diff) {
              deepDiff.DeepDiff.revertChange(fresh, componentData($el, $el.__x.$data.__xc.propertiesBeingWatched), diff);
            }); // This could probbaly be extracted to a utility method like updateComponentProperties()

            if (Object.keys(fresh).length) {
              var newData = {};
              Object.entries(fresh).forEach(function (item) {
                newData[item[0]] = item[1];
              });
              $el.__x.$data = Object.assign($el.__x.$data, newData);
            }

            $el.__x.$data.__xc.previousComponentState = JSON.stringify(componentData($el, $el.__x.$data.__xc.propertiesBeingWatched));
          };
        });
      }
    };

    var alpine = window.deferLoadingAlpine || function (alpine) {
      return alpine();
    };

    window.deferLoadingAlpine = function (callback) {
      alpine(callback);
      AlpineUndoMagicMethod.start();
    };

    return AlpineUndoMagicMethod;

})));
