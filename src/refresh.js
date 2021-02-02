import { checkForAlpine } from './utils'

const AlpineRefreshMagicMethod = {
    start() {
        checkForAlpine()

        Alpine.addMagicProperty('refresh', ($el) => {
            if (!$el.__x) {
                return
            }

            return () => $el.__x.updateElements($el)
        })
    },
}

const alpine = window.deferLoadingAlpine || ((alpine) => alpine())

window.deferLoadingAlpine = function (callback) {
    AlpineRefreshMagicMethod.start()

    alpine(callback)
}

export default AlpineRefreshMagicMethod
