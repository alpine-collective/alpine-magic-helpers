import { checkForAlpine } from './utils'
import config from './config'

const AlpineDeleteMeMagicMethod = {
    start() {
        checkForAlpine()

        Alpine.addMagicProperty('deleteme', () => {
            return JSON.stringify(config.get('breakpoints'))
        })
    },
}

const alpine = window.deferLoadingAlpine || ((alpine) => alpine())

window.deferLoadingAlpine = function (callback) {
    AlpineDeleteMeMagicMethod.start()

    alpine(callback)
}

export default AlpineDeleteMeMagicMethod
