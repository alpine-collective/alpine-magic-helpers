import {
    checkForAlpine,
    objectSetDeep,
    componentData,
    syncWithObservedComponent,
    updateOnMutation,
} from './utils'

const AlpineComponentMagicMethod = {
    start() {
        checkForAlpine()

        Alpine.addMagicProperty('parent', ($el) => {
            if (typeof $el.$parent !== 'undefined') return $el.$parent

            const parentComponent = $el.parentNode.closest('[x-data]')
            if (!parentComponent) throw new Error('Parent component not found')

            $el.$parent = syncWithObservedComponent(componentData(parentComponent), parentComponent, objectSetDeep)
            updateOnMutation(parentComponent, () => {
                $el.$parent = syncWithObservedComponent(parentComponent.__x.getUnobservedData(), parentComponent, objectSetDeep)
                $el.__x.updateElements($el)
            })
            return $el.$parent
        })

        Alpine.addMagicProperty('component', ($el) => {
            return function (componentName) {
                if (typeof this[componentName] !== 'undefined') return this[componentName]

                const componentBeingObserved = document.querySelector(`[x-data][x-id="${componentName}"], [x-data]#${componentName}`)
                if (!componentBeingObserved) throw new Error('Component not found')

                this[componentName] = syncWithObservedComponent(componentData(componentBeingObserved), componentBeingObserved, objectSetDeep)
                updateOnMutation(componentBeingObserved, () => {
                    this[componentName] = syncWithObservedComponent(componentBeingObserved.__x.getUnobservedData(), componentBeingObserved, objectSetDeep)
                    $el.__x.updateElements($el)
                })
                return this[componentName]
            }
        })
    },
}

const alpine = window.deferLoadingAlpine || ((alpine) => alpine())

window.deferLoadingAlpine = function (callback) {
    alpine(callback)

    AlpineComponentMagicMethod.start()
}

export default AlpineComponentMagicMethod
