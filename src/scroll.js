const AlpineScrollMagicMethod = {
    start() {

        Alpine.addMagicProperty('scroll', function ($el) {
            return function (target) {
                var isSmoothScrollSupported = 'scrollBehavior' in document.documentElement.style;

                if (Number.isInteger(target)) {
                    isSmoothScrollSupported
                        ? window.scroll({
                            top: target,
                            behavior: 'smooth'
                        })
                        : window.scroll(0, target);
                    return
                }

                if (typeof target === 'string') {
                    target = document.querySelector(target)
                }

                if (target instanceof Element) {
                    isSmoothScrollSupported
                        ? target.scrollIntoView({behavior: 'smooth'})
                        : target.scrollIntoView()
                    return
                }

                console.error('Unsupported $scroll target: ', target)
            }
        })
    }
}

const alpine = window.deferLoadingAlpine || ((alpine) => alpine())
window.deferLoadingAlpine = function (callback) {
    AlpineScrollMagicMethod.start()
    alpine(callback)
}

export default AlpineScrollMagicMethod
