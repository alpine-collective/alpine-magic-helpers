import { checkForAlpine, getXDirectives } from './utils'
import '@kingshott/iodine' // The library is attached directly to the global scope and it doesn't export the module

const DIRECTIVE = 'validate'

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
                    const firstValidationOnInput = modifiers.includes('immediate')

                    if (type === DIRECTIVE && typeof el.$valid === 'undefined') {
                        const validate = () => {
                            // Evaluate the rules in case they are dynamic
                            const rules = component.evaluateReturnExpression(el, expression, extraVars)

                            let value = el.value
                            // For checkbox, threat an unchecked checkbox as an empty value
                            if (el.type.toLowerCase() === 'checkbox' && !el.checked) {
                                value = ''
                            }
                            // For radio buttons, get the value from the checked options
                            if (el.type.toLowerCase() === 'radio') {
                                value = el.form[el.name].value
                            }

                            // Run validation
                            const validationRes = window.Iodine.is(value, rules)

                            // Set validity state
                            el.setCustomValidity(validationRes === true ? '' : validationRes)

                            return validationRes
                        }

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

                        // If the element is a radio button, add listeners on each input
                        const elements = (el.type.toLowerCase() === 'radio') ? el.form[el.name] : [el]
                        elements.forEach((element) => {
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
