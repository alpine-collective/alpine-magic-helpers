import { checkForAlpine, saferEval } from './utils'

// TODO: These can be refactored some to combine functionality
const AlpineComponentMagicMethod = {
    start() {
        checkForAlpine()

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
    }
}

const allowTwoWayCommunication = function(data, observedComponent) {
        return new Proxy(data, {
            set(object, prop, value) {
                if (!observedComponent.__x) {
                    throw 'Error communicating with observed component'
                }
                observedComponent.__x.$data[prop] = value
                return true
            }
        })
    }

const alpine = window.deferLoadingAlpine || ((alpine) => alpine())

window.deferLoadingAlpine = function (callback) {
    alpine(callback)

    AlpineComponentMagicMethod.start()
}

export default AlpineComponentMagicMethod
