import { checkForAlpine } from './utils'
import { AlpineMagicHelpers } from './instance'

const AlpineRangeMagicMethod = {
    start() {
        checkForAlpine()

        Alpine.addMagicProperty('range', () => {
            return function (start, stop, step = 1) {
                // Accept $range(10) and expect 1...10
                if (typeof stop === 'undefined') {
                    stop = start
                    start = start ? 1 : 0
                }

                // Accept $range(20, 10) and expect 20...10
                const reverse = start > stop
                if (reverse) {
                    [start, stop] = [stop, start]
                }

                // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from#Sequence_generator_range
                const range = Array.from({ length: (stop - start) / step + 1 }, (_, i) => start + (i * step))
                return reverse ? range.reverse() : range
            }
        })
    },
}

window.AlpineMagicHelpers = AlpineMagicHelpers
const alpine = window.deferLoadingAlpine || ((alpine) => alpine())

window.deferLoadingAlpine = function (callback) {
    AlpineRangeMagicMethod.start()

    alpine(callback)
}

export default AlpineRangeMagicMethod
