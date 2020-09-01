import AlpineComponentMagicMethod from './component'
import AlpineFetchMagicMethod from './fetch'
import AlpineIntervalMagicMethod from './interval'
import AlpineTruncateMagicMethod from './truncate'

const alpine = window.deferLoadingAlpine || ((alpine) => alpine())

window.deferLoadingAlpine = function (callback) {
    AlpineComponentMagicMethod.start()
    AlpineFetchMagicMethod.start()
    AlpineIntervalMagicMethod.start()
    AlpineTruncateMagicMethod.start()

    alpine(callback)
}

export default {
    AlpineComponentMagicMethod,
    AlpineFetchMagicMethod,
    AlpineIntervalMagicMethod,
    AlpineTruncateMagicMethod
}
