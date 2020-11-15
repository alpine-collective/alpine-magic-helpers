import smoothscroll from 'smoothscroll-polyfill'

smoothscroll.polyfill()

const AlpineScrollMagicMethod = {
    start() {
        Alpine.addMagicProperty('scroll', function ($el) {
            return function (target, options = {}) {
                const originalTarget = target

                // Check if we specified an offset
                const offset = options.offset ? parseInt(options.offset, 10) : 0
                delete options.offset

                // Support integers specified as strings
                // We do a strict check first because we don't whant to support things like "100foo"
                if (typeof target === 'string' && /^[0-9]+?/g.test(target)) {
                    target = parseInt(target, 10)
                }

                // Support for CSS query selector
                if (typeof target === 'string') {
                    target = document.querySelector(target)
                }

                // If we got an element, get the y coordinate relative to the document
                // This could happens if we trasform a selector or if we pass an Element in,
                // for example using $ref['something']
                if (target instanceof Element) {
                    target = target.getBoundingClientRect().top + window.pageYOffset
                }

                // If target has been converted to the y coordinate or was an object to begin with
                // we transform it to a ScrollToOptions dictionary
                if (Number.isInteger(target)) {
                    target = {
                        top: target - offset,
                        behavior: 'smooth', // default to smooth
                    }
                }

                // At this point target should be either be converted to a ScrollToOptions dictionary
                // or should have been an object to begin with. If it isn't, it's time to give up.
                if (typeof target !== 'object') {
                    throw Error('Unsupported $scroll target: ', originalTarget)
                }

                // Override the dictionary with the options passed as second params
                Object.assign(target, options)

                // Let's scroll eventually
                window.scroll(target)
            }
        })
    },
}

const alpine = window.deferLoadingAlpine || ((alpine) => alpine())
window.deferLoadingAlpine = function (callback) {
    AlpineScrollMagicMethod.start()
    alpine(callback)
}

export default AlpineScrollMagicMethod
