
import config from './config'

// Collection of components that contains `$screen` helper usecase
const screenComponents = []

// Debounce `updateElements` method to prevent memory leak
const debouncedScreensUpdate = () => {
    let update

    // Update component if $el is in `screenComponents`
    const updateScreens = () => {
        clearTimeout(update)
        update = setTimeout(() => {
            screenComponents.forEach(($el) =>
                $el && $el.__x && $el.__x.updateElements($el),
            )
        }, 150)
    }

    return updateScreens
}

const AlpineScreenMagicMethod = {
    start() {
        // Bind `debouncedScreensUpdate` to resize event on window
        // Note that `resize` event will be triggered on `orientationchange` event as well
        window.addEventListener('resize', debouncedScreensUpdate())

        Alpine.addMagicProperty('screen', ($el) => {
            // Push $el if it's not in the `screenComponents`
            if (!screenComponents.includes($el)) {
                screenComponents.push($el)
            }

            return (breakpoint) => {
                // Get current window width
                const width = window.innerWidth

                // Early return if breakpoint is provided as number
                if (Number.isInteger(breakpoint)) return breakpoint <= width

                // Get breakpoints from Config
                const configBreakpoints = config.get('breakpoints')

                // Check if breakpoint exists
                if (configBreakpoints[breakpoint] === undefined) {
                    throw Error('Undefined $screen property: ' + breakpoint)
                }

                // Finally compare breakpoint with window width and return as boolean
                return configBreakpoints[breakpoint] <= width
            }
        })
    },
}

const alpine = window.deferLoadingAlpine || ((alpine) => alpine())
window.deferLoadingAlpine = (callback) => {
    AlpineScreenMagicMethod.start()

    alpine(callback)
}

export default AlpineScreenMagicMethod
