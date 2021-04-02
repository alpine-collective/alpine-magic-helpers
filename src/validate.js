import { checkForAlpine, getXDirectives } from './utils'

const DIRECTIVE = 'validate'

const EMAIL_REGEX = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

const validator = {
    tests: {
        required: (value) => value !== '',
        email: (value) => value === '' || EMAIL_REGEX.test(value),
        minlength: (value, length) => value === '' || value.length >= parseInt(length),
        maxlength: (value, length) => value === '' || value.length <= parseInt(length),
        numeric: (value) => value === '' || (!isNaN(parseFloat(value)) && isFinite(value)),
        integer: (value) => !isNaN(value) && !isNaN(parseInt(value, 10)) && Math.floor(value) == value, // eslint-disable-line eqeqeq
        min: (value, min) => value === '' || parseFloat(value) >= parseFloat(min),
        max: (value, max) => value === '' || parseFloat(value) <= parseFloat(max),
        pattern: (value, pattern) => value === '' || (new RegExp(pattern)).test(value),
        match: (value, otherValue) => value === otherValue,
        lowercase: (value) => value === '' || /[a-z]/.test(value),
        uppercase: (value) => value === '' || /[a-z]/.test(value),
        digit: (value) => value === '' || /[0-9]/.test(value),
        symbol: (value) => value === '' || /[^a-zA-Z0-9\s]/.test(value),
    },
    is(value, rules = []) {
        for (const index in rules) {
            const rule = rules[index].split(':')

            if (!this.tests[rule[0]]) {
                throw Error('Invalid rule in validator: ' + rule[0])
            }

            const result = this.tests[rule[0]].apply(this, [value, rule[1]])

            if (!result) return rules[index]
        }

        return true
    },
}

const AlpineValidateCustomDirective = {
    start() {
        checkForAlpine()

        Alpine.addMagicProperty('invalid', ($el) => {
            return (target, errorType = '') => {
                const originalTarget = target

                // Support for CSS query selector
                if (typeof target === 'string') {
                    target = document.querySelector(target)
                }

                if (!(target instanceof Element)) {
                    throw Error('Unsupported $invalid target: ', originalTarget)
                }

                if (target.$dirty !== true) {
                    return false
                }

                return (errorType === '') ? target.$valid !== true : target.$valid === errorType
            }
        })

        Alpine.onBeforeComponentInitialized((component) => {
            const legacyResolveBoundAttributes = component.resolveBoundAttributes

            component.resolveBoundAttributes = function (el, initialUpdate = false, extraVars) {
                const attrs = getXDirectives(el)

                attrs.forEach(({ type, value, modifiers, expression }) => {
                    if (type === DIRECTIVE && initialUpdate) {
                        const firstValidationOnInput = modifiers.includes('immediate')
                        const validate = () => {
                            // Evaluate the rules in case they are dynamic
                            const rules = component.evaluateReturnExpression(el, expression, extraVars)

                            let value = el.form.elements[el.name].value
                            // For checkbox, threat an unchecked checkbox as an empty value
                            if (el.type.toLowerCase() === 'checkbox' && !el.checked) {
                                value = ''
                            }

                            // Run validation
                            const validationRes = validator.is(value, rules)

                            // Set validity state
                            el.setCustomValidity(validationRes === true ? '' : validationRes)

                            return validationRes
                        }

                        // If the element is a radio button, add listeners on each input
                        const elements = (el.type.toLowerCase() === 'radio') ? el.form.elements[el.name] : [el]
                        elements.forEach((element) => {
                            // Prevend the default behaviour on invalid to hide the native tooltips
                            // If the element wasn't flagged as validated, flag it and update the component
                            // to show possible errors
                            el.addEventListener('invalid', (e) => {
                                if (el.$dirty !== true) {
                                    el.$dirty = true
                                    component.updateElements(component.$el)
                                }
                                e.preventDefault()
                            })

                            element.addEventListener('input', (e) => {
                                // If immadiate validation, flag the element as validated
                                if (firstValidationOnInput) {
                                    el.$dirty = true
                                }

                                const prevValue = el.$valid
                                el.$valid = validate()

                                // If validated and the validation result has changes, refresh the component
                                if (el.$dirty && el.$valid !== prevValue) {
                                    component.updateElements(component.$el)
                                }
                            })
                            // If not immediate validation, flag the element as validated on blur
                            // and refresh the component
                            if (!firstValidationOnInput) {
                                element.addEventListener('focusout', (e) => {
                                    if (el.$dirty !== true) {
                                        el.$dirty = true
                                        component.updateElements(component.$el)
                                    }
                                })
                            }
                        })

                        // Trigger initial validation to mimic native HTML5 behaviour
                        // and prevent form from being submitted straight away
                        el.$valid = validate()
                    }
                })

                return legacyResolveBoundAttributes.bind(component)(el, initialUpdate, extraVars)
            }
        })
    },
}

const alpine = window.deferLoadingAlpine || ((alpine) => alpine())

window.deferLoadingAlpine = function (callback) {
    AlpineValidateCustomDirective.start()

    alpine(callback)
}

export default AlpineValidateCustomDirective
