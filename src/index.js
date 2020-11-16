import AlpineComponentMagicMethod from './component'
import AlpineFetchMagicMethod from './fetch'
import AlpineIntervalMagicMethod from './interval'
import AlpineRangeMagicMethod from './range'
import AlpineScreenMagicMethod from './screen'
import AlpineScrollMagicMethod from './scroll'
import AlpineTruncateMagicMethod from './truncate'

const alpine = window.deferLoadingAlpine || ((alpine) => alpine())

window.deferLoadingAlpine = function (callback) {
    AlpineComponentMagicMethod.start()
    AlpineFetchMagicMethod.start()
    AlpineIntervalMagicMethod.start()
    AlpineRangeMagicMethod.start()
    AlpineScreenMagicMethod.start()
    AlpineScrollMagicMethod.start()
    AlpineTruncateMagicMethod.start()

    alpine(callback)
}

export default {
    AlpineComponentMagicMethod,
    AlpineFetchMagicMethod,
    AlpineIntervalMagicMethod,
    AlpineRangeMagicMethod,
    AlpineScreenMagicMethod,
    AlpineScrollMagicMethod,
    AlpineTruncateMagicMethod,
}
