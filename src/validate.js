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
                    if (type === DIRECTIVE && typeof el.$valid === 'undefined') {
                        const validate = () => {
                            const rules = component.evaluateReturnExpression(el, expression, extraVars)
                            const validationRes = window.Iodine.is(el.value, rules)
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
                        el.addEventListener('input', (e) => {
                            el.$dirty = true
                            const prevValue = el.$valid
                            el.$valid = validate()
                            if (el.$valid !== prevValue) {
                                component.updateElements(component.$el)
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
