import AlpineComponentMagicMethod from './component'
import AlpineFetchMagicMethod from './fetch'
import AlpineIntervalMagicMethod from './interval'
import AlpineRangeMagicMethod from './range'
import AlpineScrollMagicMethod from './scroll'
import AlpineTruncateMagicMethod from './truncate'
import { AlpineMagicHelpers } from './instance'

window.AlpineMagicHelpers = AlpineMagicHelpers
const alpine = window.deferLoadingAlpine || ((alpine) => alpine())

window.deferLoadingAlpine = function (callback) {
    AlpineComponentMagicMethod.start()
    AlpineFetchMagicMethod.start()
    AlpineIntervalMagicMethod.start()
    AlpineRangeMagicMethod.start()
    AlpineScrollMagicMethod.start()
    AlpineTruncateMagicMethod.start()

    alpine(callback)
}

export default {
    AlpineComponentMagicMethod,
    AlpineFetchMagicMethod,
    AlpineIntervalMagicMethod,
    AlpineRangeMagicMethod,
    AlpineScrollMagicMethod,
    AlpineTruncateMagicMethod,
}
