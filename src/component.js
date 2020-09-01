import { checkForAlpine, saferEval } from './utils'

// TODO: These can be refactored some to combine functionality
const AlpineComponentMagicMethod = {
    start() {
        checkForAlpine()

        Alpine.addMagicProperty('parent', function ($el) {
            if (typeof $el.$parent !== 'undefined') return $el.$parent

            const parentComponent = $el.parentNode.closest('[x-data]')

            if (!parentComponent) throw new Error('Parent component not found')

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
                    const closestParentComponent = mutations[i].target.closest('[x-data]')

                    if (closestParentComponent && !closestParentComponent.isSameNode(parentComponent)) continue

                    if (!closestParentComponent.__x) {
                        throw 'Error locating $parent data'
                    }

                    $el.$parent = allowTwoWayCommunication(closestParentComponent.__x.getUnobservedData(), parentComponent)
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

        Alpine.addMagicProperty('component', function () {
            return function (componentName) {
                if (typeof this[componentName] !== 'undefined') return this[componentName]

                const componentBeingObserved = document.querySelector(`[x-data][x-id="${componentName}"], [x-data]#${componentName}`)

                if (!componentBeingObserved) {
                    throw 'Component not found'
                }

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

                        if (!closestParentComponent.__x) {
                            throw 'Error locating $component data'
                        }

                        this[componentName] = allowTwoWayCommunication(closestParentComponent.__x.getUnobservedData(), componentBeingObserved)
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

const allowTwoWayCommunication = (data, observedComponent) => {
    return new Proxy(data, {
        set(target, prop, value) {
            if (!observedComponent.__x) {
                throw new Error('Failed to communicate with observed component')
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
