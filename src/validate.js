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
        integer: (value) => value === '' || (!isNaN(value) && !isNaN(parseInt(value, 10)) && Math.floor(value) == value), // eslint-disable-line eqeqeq
        min: (value, min) => value === '' || parseFloat(value) >= parseFloat(min),
        max: (value, max) => value === '' || parseFloat(value) <= parseFloat(max),
        pattern: (value, pattern) => value === '' || (new RegExp(pattern)).test(value),
        equals: (value, otherValue) => value === '' || value === otherValue,
        minoptions: (value, min) => value === '' || (Array.isArray(value) && value.length >= parseFloat(min)),
        maxoptions: (value, max) => value === '' || (Array.isArray(value) && value.length <= parseFloat(max)),
    },
    is(value, rules = []) {
        for (const index in rules) {
            const rule = rules[index].split(':')
            const test = this.tests[rule[0]] || window.AlpineValidationRules[rule[0]]

            if (!test) {
                throw Error('Invalid rule in validator: ' + rule[0])
            }

            const result = test.apply(this, [value, rule[1]])

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

                // Note Alpine has a bug end it strips all backslashes breaking regular expresions

                return (errorType === '')
                    ? target.$valid !== true
                    : (
                        // Note Alpine has a bug end it strips all backslashes breaking regular expresions
                        (typeof target.$valid === 'string')
                        ? target.$valid.replace(/\\/g, '') === errorType
                        : target.$valid === errorType
                    )
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
                            // Note Alpine has a bug end it strips all backslashes breaking regular expresions
                            const rules = component.evaluateReturnExpression(el, expression.replace(/\\/g, '\\\\'), extraVars)

                            if (! Array.isArray(rules)) {
                                throw Error('x-validate must contain an array of validation rules');
                            }

                            let value = el.form.elements[el.name].value

                            if (el.type.toLowerCase() === 'checkbox' && !el.checked) {
                                value = ''
                            }

                            if (el.type.toLowerCase() !== 'radio' && (el.form.elements[el.name] instanceof NodeList)) {
                                value = Array.from(el.form.elements[el.name]).reduce((acc, curr) => {
                                    if (curr.checked) {
                                        acc.push(curr.value)
                                    }
                                    return acc
                                }, [])
                                if (value.length === 0 || (value.length === 1 && value[0] === '')) {
                                    value = ''
                                }
                            }

                            if (el.type.toLowerCase() === 'select-multiple') {
                                value = Array(...el.options).reduce((acc, option) => {
                                    if (option.selected === true) {
                                        acc.push(option.value)
                                    }
                                    return acc
                                }, [])
                                if (value.length === 0 || (value.length === 1 && value[0] === '')) {
                                    value = ''
                                }
                            }

                            // Run validation
                            const validationRes = validator.is(value, rules)

                            // Set validity state
                            el.setCustomValidity(validationRes === true ? '' : validationRes)

                            return validationRes
                        }

                        // If the element is a radio button, add listeners on each input
                        let elements = el.form.elements[el.name]
                        if (!(elements instanceof NodeList)) elements = [elements]
                        elements.forEach((element) => {
                            // Prevent the default behaviour on invalid to hide the native tooltips
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
                                let eventName = 'focusout'
                                if (['radio', 'checkbox', 'select-one', 'select-multiple'].includes(element.type.toLowerCase())) {
                                    eventName = 'change'
                                }
                                element.addEventListener(eventName, (e) => {
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

window.AlpineValidationRules = [];

export default AlpineValidateCustomDirective
