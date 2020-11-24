import {
    checkForAlpine,
    objectSetDeep,
    syncWithObservedComponent,
    updateOnMutation,
} from './utils'

const AlpineTeleportMagicMethod = {
    start() {
        checkForAlpine()
        Alpine.addMagicProperty('teleport', ($el) => {
            return (from = $el, to = document.body, options = { prepend: false }) => {
                // Figure out element that needs to be teleported
                const element = typeof from === 'string'
                    ? document.createRange().createContextualFragment(from)
                    : from

                // Figure out destination
                const target = typeof to === 'string'
                    ? document.querySelector(to)
                    : to

                // Check if destination is exists
                if (!target) {
                    throw Error(`Destination "${to}" not found. Does your element have proper attribute?`)
                }

                // Set mutation to sync initial component data if element is not a component
                if (!element.__x) {
                    updateOnMutation($el, () => {
                        syncWithObservedComponent($el.__x.getUnobservedData(), $el, objectSetDeep)

                        $el.__x.updateElements(element)
                    })
                }

                // Prepend element to destination if 'prepend' option is set to true
                if (options.prepend) return target.prepend(element)

                // Append element to destination
                target.append(element)
            }
        })
    },
}

const alpine = window.deferLoadingAlpine || ((alpine) => alpine())
window.deferLoadingAlpine = (callback) => {
    AlpineTeleportMagicMethod.start()
    alpine(callback)
}

export default AlpineTeleportMagicMethod
