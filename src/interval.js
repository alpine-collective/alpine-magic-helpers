import {
    checkForAlpine,
    importOrderCheck,
} from './utils'

importOrderCheck()

const AlpineIntervalMagicMethod = {
    start() {
        checkForAlpine()

        Alpine.addMagicProperty('interval', ($el) => {
            return function (...parameters) {
                if (typeof parameters[0] !== 'function') return parameters[0]

                let timer = parameters[1]
                let delay = 0
                let forceInterval = false

                // Users can pass in an object as a second parameter instead
                if (typeof parameters[1] === 'object') {
                    if (Object.prototype.hasOwnProperty.call(parameters[1], 'timer')) {
                        timer = parameters[1].timer
                    }

                    if (Object.prototype.hasOwnProperty.call(parameters[1], 'delay')) {
                        delay = parameters[1].delay
                    }

                    if (Object.prototype.hasOwnProperty.call(parameters[1], 'forceInterval')) {
                        forceInterval = parameters[1].forceInterval
                    }
                }

                let autoIntervalLoop = null

                const loop = () => {
                    autoIntervalLoop = setTimeout(() => {
                        parameters[0].call(this)
                        forceInterval ? loop() : requestAnimationFrame(loop)
                    }, timer)
                }

                autoIntervalLoop = setTimeout(() => {
                    forceInterval ? loop() : requestAnimationFrame(loop)
                }, delay)

                this.$watch('autoIntervalTest', test => {
                    if (test) {
                        forceInterval ? loop() : requestAnimationFrame(loop)
                    } else {
                        clearTimeout(autoIntervalLoop)
                    }
                })
            }
        })
    },
}

const alpine = window.deferLoadingAlpine || ((alpine) => alpine())

window.deferLoadingAlpine = function (callback) {
    AlpineIntervalMagicMethod.start()

    alpine(callback)
}

export default AlpineIntervalMagicMethod
