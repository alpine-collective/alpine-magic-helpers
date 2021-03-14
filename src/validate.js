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
                            const rules = component.evaluateReturnExpression(el, expression, extraVars)
                            let value = el.value
                            if (el.type.toLowerCase() === 'checkbox' && !el.checked) {
                                value = ''
                            }
                            if (el.type.toLowerCase() === 'radio') {
                                value = el.form[el.name].value
                            }
                            const validationRes = window.Iodine.is(value, rules)
                            el.setCustomValidity(validationRes === true ? '' : validationRes)
                            return validationRes
                        }
                        el.addEventListener('invalid', (e) => {
                            if (el.$dirty !== true) {
                                el.$dirty = true
                                component.updateElements(component.$el)
                            }
                            e.preventDefault()
                        })
                        let elements = []
                        if (el.type.toLowerCase() === 'radio') {
                            elements = el.form[el.name]
                        } else {
                            elements = [el]
                        }
                        elements.forEach((element) => {
                            element.addEventListener('input', (e) => {
                                if (firstValidationOnInput) {
                                    el.$dirty = true
                                }
                                const prevValue = el.$valid
                                el.$valid = validate()
                                if (el.$dirty && el.$valid !== prevValue) {
                                    component.updateElements(component.$el)
                                }
                            })
                            if (!firstValidationOnInput) {
                                element.addEventListener('focusout', (e) => {
                                    if (el.$dirty !== true) {
                                        el.$dirty = true
                                        component.updateElements(component.$el)
                                    }
                                })
                            }
                        })
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
