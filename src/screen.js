
const AlpineScreenMagicMethod = {
    start() {
        Alpine.addMagicProperty('screen', function ($el) {
            return function (breakpoint = 'xs', framework = 'tw') {
                // Get current window innerWidth
                const width = window.innerWidth

                // bind resize event to window with debounce
                let update
                window.addEventListener('resize', () => {
                    clearTimeout(update)
                    update = setTimeout(() => {
                        $el.__x.updateElements($el)
                    }, 150)
                })

                // Frameworks and Breakpoints
                const breakpoints = {
                    // TailwindCSS
                    tw: {
                        xs: 0,
                        sm: 640,
                        md: 768,
                        lg: 1024,
                        xl: 1280,
                        '2xl': 1536,
                    },
                    // Bootstrap
                    bs: {
                        xs: 0,
                        sm: 576,
                        md: 768,
                        lg: 992,
                        xl: 1200,
                    },
                    // Bulma
                    bl: {
                        mobile: 0,
                        tablet: 769,
                        desktop: 1024,
                        widescreen: 1216,
                        fullhd: 1408,
                    },
                    // Materialize
                    mt: {
                        s: 0,
                        m: 601,
                        l: 993,
                        xl: 1201,
                    },
                }

                // If size provided as number, early return
                if (Number.isInteger(breakpoint)) return breakpoint <= width

                // Check if any unsupported frameworks or breakpoints
                if (breakpoints[framework] === undefined) {
                    throw Error('Unsupported framework: ' + framework)
                }

                if (breakpoints[framework][breakpoint] === undefined) {
                    throw Error('Unsupported $screen breakpoint: ' + breakpoint)
                }

                return breakpoints[framework][breakpoint] <= width
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
