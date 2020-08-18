function registerComponentMagicMethod() {
    Alpine.addMagicProperty('parent', function ($el) {
        if (typeof $el.$parent !== 'undefined') return $el.$parent

        const parentComponent = $el.parentNode.closest('[x-data]')
        if (!parentComponent) throw 'Parent component not found'

        let data
        if (parentComponent.__x) {
            data = parentComponent.__x.getUnobservedData()
        } else {
            // Component isn't ready yet so lets try to get its initial state
            data = saferEval(parentComponent.getAttribute('x-data'), parentComponent)
        }

        $el.$parent = disableUpdatingPropertyDirectly(data, '$parent')

        const parentObserver = new MutationObserver(mutations => {
            for (let i = 0; i < mutations.length; i++) {
                const closestParentComponent = mutations[i].target.closest('[x-data]')
                if ((closestParentComponent && closestParentComponent.isSameNode($el))) continue
                $el.$parent = disableUpdatingPropertyDirectly(closestParentComponent.__x.getUnobservedData(), '$parent')
                $el.__x.updateElements($el)
            }
        })

        parentObserver.observe(parentComponent, {
            attributes: true,
            childList: true,
            characterData: true,
            subtree: true,
        })

        return data
    })

    Alpine.addMagicProperty('component', function ($el) {
        return function (componentName) {

            if (typeof this[componentName] !== 'undefined') return this[componentName]

            // Collect components from parameters
            const componentBeingObserved = document.querySelector(`[x-data][x-observable-id="${componentName}"]`)
            
            // Set initial state
            let data
            if (componentBeingObserved.__x) {
                data = componentBeingObserved.__x.getUnobservedData()
            } else {
                // Component isn't ready yet so lets try to get its initial state
                data = saferEval(componentBeingObserved.getAttribute('x-data'), componentBeingObserved)
            }

            this[componentName] = disableUpdatingPropertyDirectly(data, '$component')

            // Set observers
            const observer = new MutationObserver(mutations => {
                for (let i = 0; i < mutations.length; i++) {
                    const closestParentComponent = mutations[i].target.closest('[x-data]')
                    if ((closestParentComponent && closestParentComponent.isSameNode(this.$el))) continue
                    this[componentName] = disableUpdatingPropertyDirectly(closestParentComponent.__x.getUnobservedData(), '$component')
                }
            })
            observer.observe(componentBeingObserved, {
                attributes: true,
                childList: true,
                characterData: true,
                subtree: true,
            })
            return this[componentName]
        }
    })
    function disableUpdatingPropertyDirectly(data, type) {
        return new Proxy(data, {
            set() {
                throw `Updating the ${type} magic helper is not supported.`
            }
        })
    }

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
    alpine(callback)
    registerComponentMagicMethod()
}

export default registerComponentMagicMethod