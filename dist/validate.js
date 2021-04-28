(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, (global.AlpineMagicHelpers = global.AlpineMagicHelpers || {}, global.AlpineMagicHelpers.validate = factory()));
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

    var DIRECTIVE = 'validate';
    var EMAIL_REGEX = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    var validator = {
      tests: {
        required: function required(value) {
          return value !== '';
        },
        email: function email(value) {
          return value === '' || EMAIL_REGEX.test(value);
        },
        minlength: function minlength(value, length) {
          return value === '' || value.length >= parseInt(length);
        },
        maxlength: function maxlength(value, length) {
          return value === '' || value.length <= parseInt(length);
        },
        numeric: function numeric(value) {
          return value === '' || !isNaN(parseFloat(value)) && isFinite(value);
        },
        integer: function integer(value) {
          return value === '' || !isNaN(value) && !isNaN(parseInt(value, 10)) && Math.floor(value) == value;
        },
        // eslint-disable-line eqeqeq
        min: function min(value, _min) {
          return value === '' || parseFloat(value) >= parseFloat(_min);
        },
        max: function max(value, _max) {
          return value === '' || parseFloat(value) <= parseFloat(_max);
        },
        pattern: function pattern(value, _pattern) {
          return value === '' || new RegExp(_pattern).test(value);
        },
        equals: function equals(value, otherValue) {
          return value === '' || value === otherValue;
        },
        minoptions: function minoptions(value, min) {
          return value === '' || Array.isArray(value) && value.length >= parseFloat(min);
        },
        maxoptions: function maxoptions(value, max) {
          return value === '' || Array.isArray(value) && value.length <= parseFloat(max);
        }
      },
      is: function is(value, rules) {
        if (rules === void 0) {
          rules = [];
        }

        for (var index in rules) {
          var rule = rules[index].split(':');
          var test = this.tests[rule[0]] || window.AlpineValidationRules[rule[0]];

          if (!test) {
            throw Error('Invalid rule in validator: ' + rule[0]);
          }

          var result = test.apply(this, [value, rule[1]]);
          if (!result) return rules[index];
        }

        return true;
      }
    };
    var AlpineValidateCustomDirective = {
      start: function start() {
        checkForAlpine();
        Alpine.addMagicProperty('invalid', function ($el) {
          return function (target, errorType) {
            if (errorType === void 0) {
              errorType = '';
            }

            var originalTarget = target; // Support for CSS query selector

            if (typeof target === 'string') {
              target = document.querySelector(target);
            }

            if (!(target instanceof Element)) {
              throw Error('Unsupported $invalid target: ', originalTarget);
            }

            if (target.$dirty !== true) {
              return false;
            } // Note Alpine has a bug end it strips all backslashes breaking regular expresions


            return errorType === '' ? target.$valid !== true : // Note Alpine has a bug end it strips all backslashes breaking regular expresions
            typeof target.$valid === 'string' ? target.$valid.replace(/\\/g, '') === errorType : target.$valid === errorType;
          };
        });
        Alpine.onBeforeComponentInitialized(function (component) {
          var legacyResolveBoundAttributes = component.resolveBoundAttributes;

          component.resolveBoundAttributes = function (el, initialUpdate, extraVars) {
            if (initialUpdate === void 0) {
              initialUpdate = false;
            }

            var attrs = getXDirectives(el);
            attrs.forEach(function (_ref) {
              var type = _ref.type,
                  modifiers = _ref.modifiers,
                  expression = _ref.expression;

              if (type === DIRECTIVE && initialUpdate) {
                var firstValidationOnInput = modifiers.includes('immediate');

                var validate = function validate() {
                  // Evaluate the rules in case they are dynamic
                  // Note Alpine has a bug end it strips all backslashes breaking regular expresions
                  var rules = component.evaluateReturnExpression(el, expression.replace(/\\/g, '\\\\'), extraVars);

                  if (!Array.isArray(rules)) {
                    throw Error('x-validate must contain an array of validation rules');
                  }

                  var value = el.form.elements[el.name].value;

                  if (el.type.toLowerCase() === 'checkbox' && !el.checked) {
                    value = '';
                  }

                  if (el.type.toLowerCase() !== 'radio' && el.form.elements[el.name] instanceof NodeList) {
                    value = Array.from(el.form.elements[el.name]).reduce(function (acc, curr) {
                      if (curr.checked) {
                        acc.push(curr.value);
                      }

                      return acc;
                    }, []);

                    if (value.length === 0 || value.length === 1 && value[0] === '') {
                      value = '';
                    }
                  }

                  if (el.type.toLowerCase() === 'select-multiple') {
                    value = Array.apply(void 0, el.options).reduce(function (acc, option) {
                      if (option.selected === true) {
                        acc.push(option.value);
                      }

                      return acc;
                    }, []);

                    if (value.length === 0 || value.length === 1 && value[0] === '') {
                      value = '';
                    }
                  } // Run validation


                  var validationRes = validator.is(value, rules); // Set validity state

                  el.setCustomValidity(validationRes === true ? '' : validationRes);
                  return validationRes;
                }; // If the element is a radio button, add listeners on each input


                var elements = el.form.elements[el.name];
                if (!(elements instanceof NodeList)) elements = [elements];
                elements.forEach(function (element) {
                  // Prevent the default behaviour on invalid to hide the native tooltips
                  // If the element wasn't flagged as validated, flag it and update the component
                  // to show possible errors
                  el.addEventListener('invalid', function (e) {
                    if (el.$dirty !== true) {
                      el.$dirty = true;
                      component.updateElements(component.$el);
                    }

                    e.preventDefault();
                  });
                  element.addEventListener('input', function (e) {
                    // If immadiate validation, flag the element as validated
                    if (firstValidationOnInput) {
                      el.$dirty = true;
                    }

                    var prevValue = el.$valid;
                    el.$valid = validate(); // If validated and the validation result has changes, refresh the component

                    if (el.$dirty && el.$valid !== prevValue) {
                      component.updateElements(component.$el);
                    }
                  }); // If not immediate validation, flag the element as validated on blur
                  // and refresh the component

                  if (!firstValidationOnInput) {
                    var eventName = 'focusout';

                    if (['radio', 'checkbox', 'select-one', 'select-multiple'].includes(element.type.toLowerCase())) {
                      eventName = 'change';
                    }

                    element.addEventListener(eventName, function (e) {
                      if (el.$dirty !== true) {
                        el.$dirty = true;
                        component.updateElements(component.$el);
                      }
                    });
                  }
                }); // Trigger initial validation to mimic native HTML5 behaviour
                // and prevent form from being submitted straight away

                el.$valid = validate();
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
      AlpineValidateCustomDirective.start();
      alpine(callback);
    };

    window.AlpineValidationRules = [];

    return AlpineValidateCustomDirective;

})));
