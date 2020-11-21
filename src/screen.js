
import config from './config'

const AlpineScreenMagicMethod = {
    start() {
        Alpine.addMagicProperty('screen', function ($el) {
            // bind resize event to window with debounce
            let update
            const updateScreen = () => {
                clearTimeout(update)
                update = setTimeout(() => {
                    $el.__x.updateElements($el)
                }, 150)

                // set $screenHelperInitialized to prevent multiple calls
                window.$screenHelperInitialized = true
            }

            // bind resize event to window if not initialized
            if (!window.$screenHelperInitialized) {
                window.addEventListener('resize', updateScreen)
            }

            return function (target) {
                // Get current window dimensions
                const width = window.innerWidth
                const height = window.innerHeight

                // If size provided as number, early return
                if (Number.isInteger(target)) return target <= width

                // Breakpoints and extras
                const screen = {
                    ...config.get('breakpoints'),
                    touch: 'ontouchstart' in window,
                    portrait: height > width,
                    landscape: width > height,
                }

                // Check if target exists
                if (screen[target] === undefined) {
                    throw Error('Undefined $screen property: ' + target)
                }

                // return if target is a breakpoint
                if (Number.isInteger(screen[target])) {
                    return screen[target] <= width
                }

                // return screen extras
                return screen[target]
            }
        })
    },
}

const alpine = window.deferLoadingAlpine || ((alpine) => alpine())
window.deferLoadingAlpine = function (callback) {
    AlpineScreenMagicMethod.start()
    alpine(callback)
}

export default AlpineScreenMagicMethod
