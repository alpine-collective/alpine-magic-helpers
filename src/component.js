function registerComponentMagicMethod() {
    Alpine.magicProperties.hasOwnProperty('parent') ||
    Alpine.addMagicProperty('parent', function ($el) {
        if (typeof $el.$parent !== 'undefined') return $el.$parent

        const parentComponent = $el.parentNode.closest('[x-data]')
        if (!parentComponent) throw 'Parent component not found'

        // Add this to trigger mutations on update
        parentComponent.setAttribute('x-bind:data-last-refresh', 'Date.now()')

        let data
        if (parentComponent.__x) {
            data = parentComponent.__x.getUnobservedData()
        } else {
            // Component isn't ready yet so lets try to get its initial state
            data = saferEval(parentComponent.getAttribute('x-data'), parentComponent)
        }

        $el.$parent = allowTwoWayCommunication(data, parentComponent)

        const parentObserver = new MutationObserver(mutations => {
            for (let i = 0; i < mutations.length; i++) {
                const mutatedComponent = mutations[i].target.closest('[x-data]')
                if ((mutatedComponent && !mutatedComponent.isSameNode(parentComponent))) continue
                $el.$parent = allowTwoWayCommunication(parentComponent.__x.getUnobservedData(), parentComponent)
                $el.__x.updateElements($el)
                return
            }
        })
        parentObserver.observe(parentComponent, {
            attributes: true,
            childList: true,
            characterData: true,
            subtree: true,
        })
        return $el.$parent
    })

    Alpine.magicProperties.hasOwnProperty('component') ||
    Alpine.addMagicProperty('component', function ($el) {
        return function (componentName) {

            if (typeof this[componentName] !== 'undefined') return this[componentName]

            const componentBeingObserved = document.querySelector(`[x-data][x-id="${componentName}"], [x-data]#${componentName}`)
            if (!componentBeingObserved) throw 'Component not found'

            // Add this to trigger mutations on update
            componentBeingObserved.setAttribute('x-bind:data-last-refresh', 'Date.now()')

            // Set initial state
            let data
            if (componentBeingObserved.__x) {
                data = componentBeingObserved.__x.getUnobservedData()
            } else {
                // Component isn't ready yet so lets try to get its initial state
                data = saferEval(componentBeingObserved.getAttribute('x-data'), componentBeingObserved)
            }

            this[componentName] = allowTwoWayCommunication(data, componentBeingObserved)

            const observer = new MutationObserver(mutations => {
                for (let i = 0; i < mutations.length; i++) {
                    const closestParentComponent = mutations[i].target.closest('[x-data]')
                    if ((closestParentComponent && closestParentComponent.isSameNode(this.$el))) continue
                    this[componentName] = allowTwoWayCommunication(componentBeingObserved.__x.getUnobservedData(), componentBeingObserved)
                    return
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
    function allowTwoWayCommunication(data, observedComponent) {
        const handler = (scope = null) => {
            return {
                get(target, key) {
                    if (target[key] != null && typeof target[key] === 'object') {
                        const path = scope ? `${scope}.${key}` : key
                        return new Proxy(target[key], handler(path))
                    }
                    return target[key]
                },
                set(target, key, value) {
                    if (!observedComponent.__x) {
                        throw 'Error communicating with observed component'
                    }
                    const path = scope ? `${scope}.${key}` : key
                    objectSetDeep(observedComponent.__x.$data, path, value)
                    return true
                }
            }
        }
        return new Proxy(data, handler())
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

    // Borrowed from https://stackoverflow.com/a/54733755/1437789
    function objectSetDeep (object, path, value) {
        path = path.toString().match(/[^.[\]]+/g) || [];
        path.slice(0, -1).reduce((a, currentKey, index) => // Iterate all of them except the last one
            Object(a[currentKey]) === a[currentKey] // Does the key exist and is its value an object?
                // Yes: then follow that path
                ? a[currentKey]
                // No: create the key. Is the next key a potential array-index?
                : a[currentKey] = Math.abs(path[index + 1]) >> 0 === +path[index + 1]
                    ? [] // Yes: assign a new array object
                    : {}, // No: assign a new plain object
            object)[path[path.length - 1]] = value // Finally assign the value to the last key
        return object
    }
}

const alpine = window.deferLoadingAlpine || ((alpine) => alpine())
window.deferLoadingAlpine = function (callback) {
    alpine(callback)
    registerComponentMagicMethod()
}

export default registerComponentMagicMethod
