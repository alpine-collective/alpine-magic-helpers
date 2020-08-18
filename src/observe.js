function registerObserveMagicMethod() {
    Alpine.addMagicProperty('observe', function ($el) {
        const objectsBeingObserved = {}
        const observers = []
        return function (...parameters) {

            // Collect components from parameters
            parameters.forEach(parameter => {
                if (parameter === 'parent') {
                    objectsBeingObserved['parent'] = $el.parentNode.closest('[x-data]')
                    return
                }
                objectsBeingObserved[parameter] = document.querySelector(`[x-data][x-observable-id="${parameter}"]`)
            })
            
            // Set initial state
            for (const [key, component] of Object.entries(objectsBeingObserved)) {
                if (component.__x) {
                    this[key] = component.__x.getUnobservedData()
                } else {
                    // Component isn't ready yet so lets try to get its initial state
                    this[key] = saferEval(component.getAttribute('x-data'), component)
                }
            }

            // Set observers
            for (const [key, component] of Object.entries(objectsBeingObserved)) {
                observers[key] = new MutationObserver(mutations => {
                    for (let i = 0; i < mutations.length; i++) {
                        const closestParentComponent = mutations[i].target.closest('[x-data]')
                        if ((closestParentComponent && closestParentComponent.isSameNode(this.$el))) continue
                        this[key] = closestParentComponent.__x.getUnobservedData()
                    }
                })
                observers[key].observe(component, {
                    attributes: true,
                    childList: true,
                    characterData: true,
                    subtree: true,
                })
            }

            return parameters[0]
        }
    })
    // TODO: extract this if it needs to be reusable
    // This was taken from AlpineJs unaltered
    function saferEval(expression, dataContext, additionalHelperVariables = {}) {
        if (typeof expression === 'function') {
            return expression.call(dataContext)
        }
        return (new Function(['$data', ...Object.keys(additionalHelperVariables)], `var __alpine_result; with($data) { __alpine_result = ${expression} }; return __alpine_result`))(
            dataContext, ...Object.values(additionalHelperVariables)
        )
    }
}

const alpine = window.deferLoadingAlpine || ((alpine) => alpine())
window.deferLoadingAlpine = function (callback) {
    registerObserveMagicMethod()
    alpine(callback)
}

export default registerObserveMagicMethod