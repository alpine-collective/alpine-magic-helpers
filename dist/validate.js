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

    class e{constructor(){this.locale=void 0,this.messages=this._defaultMessages();}_dateCompare(e,t,r,s=!1){return !!this.isDate(e)&&!(!this.isDate(t)&&!this.isInteger(t))&&(t="number"==typeof t?t:t.getTime(),"less"===r&&s?e.getTime()<=t:"less"!==r||s?"more"===r&&s?e.getTime()>=t:"more"!==r||s?void 0:e.getTime()>t:e.getTime()<t)}_defaultMessages(){return {after:"The date must be after: '[PARAM]'",afterOrEqual:"The date must be after or equal to: '[PARAM]'",array:"Value must be an array",before:"The date must be before: '[PARAM]'",beforeOrEqual:"The date must be before or equal to: '[PARAM]'",boolean:"Value must be true or false",date:"Value must be a date",different:"Value must be different to '[PARAM]'",endingWith:"Value must end with '[PARAM]'",email:"Value must be a valid email address",falsy:"Value must be a falsy value (false, 'false', 0 or '0')",in:"Value must be one of the following options: [PARAM]",integer:"Value must be an integer",json:"Value must be a parsable JSON object string",maximum:"Value must not be greater than '[PARAM]' in size or character length",minimum:"Value must not be less than '[PARAM]' in size or character length",notIn:"Value must not be one of the following options: [PARAM]",numeric:"Value must be numeric",optional:"Value is optional",regexMatch:"Value must satisify the regular expression: [PARAM]",required:"Value must be present",same:"Value must be '[PARAM]'",startingWith:"Value must start with '[PARAM]'",string:"Value must be a string",truthy:"Value must be a truthy value (true, 'true', 1 or '1')",url:"Value must be a valid url",uuid:"Value must be a valid UUID"}}addRule(t,r){e.prototype[`is${t[0].toUpperCase()}${t.slice(1)}`]=r;}getErrorMessage(e,t){let r=e.split(":")[0],s=t||e.split(":")[1];return ["after","afterOrEqual","before","beforeOrEqual"].includes(r)&&(s=new Date(parseInt(s)).toLocaleTimeString(this.locale,{year:"numeric",month:"short",day:"numeric",hour:"2-digit",minute:"numeric"})),[null,void 0].includes(s)?this.messages[r]:this.messages[r].replace("[PARAM]",s)}isAfter(e,t){return this._dateCompare(e,t,"more",!1)}isAfterOrEqual(e,t){return this._dateCompare(e,t,"more",!0)}isArray(e){return Array.isArray(e)}isBefore(e,t){return this._dateCompare(e,t,"less",!1)}isBeforeOrEqual(e,t){return this._dateCompare(e,t,"less",!0)}isBoolean(e){return [!0,!1].includes(e)}isDate(e){return e&&"[object Date]"===Object.prototype.toString.call(e)&&!isNaN(e)}isDifferent(e,t){return e!=t}isEndingWith(e,t){return this.isString(e)&&e.endsWith(t)}isEmail(e){return new RegExp("^\\S+@\\S+[\\.][0-9a-z]+$").test(String(e).toLowerCase())}isFalsy(e){return [0,"0",!1,"false"].includes(e)}isIn(e,t){return (t="string"==typeof t?t.split(","):t).includes(e)}isInteger(e){return Number.isInteger(e)&&parseInt(e).toString()===e.toString()}isJson(e){try{return "object"==typeof JSON.parse(e)}catch(e){return !1}}isMaximum(e,t){return e="string"==typeof e?e.length:e,parseFloat(e)<=t}isMinimum(e,t){return e="string"==typeof e?e.length:e,parseFloat(e)>=t}isNotIn(e,t){return !this.isIn(e,t)}isNumeric(e){return !isNaN(parseFloat(e))&&isFinite(e)}isOptional(e){return [null,void 0,""].includes(e)}isRegexMatch(e,t){return new RegExp(t).test(String(e))}isRequired(e){return !this.isOptional(e)}isSame(e,t){return e==t}isStartingWith(e,t){return this.isString(e)&&e.startsWith(t)}isString(e){return "string"==typeof e}isTruthy(e){return [1,"1",!0,"true"].includes(e)}isUrl(e){return new RegExp("^(https?:\\/\\/)?((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|((\\d{1,3}\\.){3}\\d{1,3}))(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*(\\?[;&a-z\\d%_.~+=-]*)?(\\#[-a-z\\d_]*)?$").test(String(e).toLowerCase())}isUuid(e){return new RegExp("^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$").test(String(e).toLowerCase())}is(e,t=[]){if(!t.length)return !0;if("optional"===t[0]&&this.isOptional(e))return !0;for(let r in t)if("optional"!==t[r]&&!this["is"+(t[r].split(":")[0][0].toUpperCase()+t[r].split(":")[0].slice(1))].apply(this,[e,t[r].split(":")[1]]))return t[r];return !0}setErrorMessages(e){this.messages=e;}setLocale(e){this.locale=e;}}window.Iodine=new e;

    var DIRECTIVE = 'validate';
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
            }

            return errorType === '' ? target.$valid !== true : target.$valid === errorType;
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
              var firstValidationOnInput = modifiers.includes('immediate');

              if (type === DIRECTIVE && typeof el.$valid === 'undefined') {
                var validate = function validate() {
                  // Evaluate the rules in case they are dynamic
                  var rules = component.evaluateReturnExpression(el, expression, extraVars);
                  var value = el.value; // For checkbox, threat an unchecked checkbox as an empty value

                  if (el.type.toLowerCase() === 'checkbox' && !el.checked) {
                    value = '';
                  } // For radio buttons, get the value from the checked options


                  if (el.type.toLowerCase() === 'radio') {
                    value = el.form[el.name].value;
                  } // Run validation


                  var validationRes = window.Iodine.is(value, rules); // Set validity state

                  el.setCustomValidity(validationRes === true ? '' : validationRes);
                  return validationRes;
                }; // Prevend the default behaviour on invalid to hide the native tooltips
                // If the element wasn't flagged as validated, flag it and update the component
                // to show possible errors


                el.addEventListener('invalid', function (e) {
                  if (el.$dirty !== true) {
                    el.$dirty = true;
                    component.updateElements(component.$el);
                  }

                  e.preventDefault();
                }); // If the element is a radio button, add listeners on each input

                var elements = el.type.toLowerCase() === 'radio' ? el.form[el.name] : [el];
                elements.forEach(function (element) {
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
                    element.addEventListener('focusout', function (e) {
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

    return AlpineValidateCustomDirective;

})));
