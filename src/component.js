import { checkForAlpine, saferEval } from './utils'

// TODO: These can be refactored some to combine functionality
const AlpineComponentMagicMethod = {
    start() {
        checkForAlpine()

        Alpine.addMagicProperty('parent', function ($el) {
            if (typeof $el.$parent !== 'undefined') return $el.$parent

            const parentComponent = $el.parentNode.closest('[x-data]')
            if (!parentComponent) throw new Error('Parent component not found')

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

        Alpine.addMagicProperty('component', function ($el) {
            return function (componentName) {
                if (typeof this[componentName] !== 'undefined') return this[componentName]

                const componentBeingObserved = document.querySelector(`[x-data][x-id="${componentName}"], [x-data]#${componentName}`)
                if (!componentBeingObserved) throw new Error('Component not found')

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
    },
}

const allowTwoWayCommunication = function (data, observedComponent) {
    const handler = (scope = null) => {
        return {
            get(target, key) {
                if (target[key] !== null && typeof target[key] === 'object') {
                    const path = scope ? `${scope}.${key}` : key
                    return new Proxy(target[key], handler(path))
                }
                return target[key]
            },
            set(target, key, value) {
                if (!observedComponent.__x) {
                    throw new Error('Error communicating with observed component')
                }
                const path = scope ? `${scope}.${key}` : key
                objectSetDeep(observedComponent.__x.$data, path, value)
                return true
            },
        }
    }
    return new Proxy(data, handler())
}

// Borrowed from https://stackoverflow.com/a/54733755/1437789
const objectSetDeep = function (object, path, value) {
    path = path.toString().match(/[^.[\]]+/g) || []
    // Iterate all of them except the last one
    path.slice(0, -1).reduce((a, currentKey, index) => {
        // If the key does not exist or its value is not an object, create/override the key
        if (Object(a[currentKey]) !== a[currentKey]) {
            // Is the next key a potential array-index?
            a[currentKey] = Math.abs(path[index + 1]) >> 0 === +path[index + 1]
                ? [] // Yes: assign a new array object
                : {} // No: assign a new plain object
        }
        return a[currentKey]
    }, object)[path[path.length - 1]] = value // Finally assign the value to the last key
    return object
}

const alpine = window.deferLoadingAlpine || ((alpine) => alpine())

window.deferLoadingAlpine = function (callback) {
    alpine(callback)

    AlpineComponentMagicMethod.start()
}

export default AlpineComponentMagicMethod
