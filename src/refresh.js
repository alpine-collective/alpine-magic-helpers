import {
    checkForAlpine,
    importOrderCheck,
} from './utils'

importOrderCheck()

const AlpineRefreshMagicMethod = {
    start() {
        checkForAlpine()

        Alpine.addMagicProperty('refresh', ($el) => {
            if (!$el.__x) {
                return () => {}
            }

            return (component = $el) => component.__x.updateElements(component)
        })
    },
}

const alpine = window.deferLoadingAlpine || ((alpine) => alpine())

window.deferLoadingAlpine = function (callback) {
    AlpineRefreshMagicMethod.start()

    alpine(callback)
}

export default AlpineRefreshMagicMethod
