import { checkForAlpine } from './utils'

const AlpineIntervalMagicMethod = {
    start() {
        checkForAlpine()

        Alpine.addMagicProperty('interval', function () {
            return function (...parameters) {
                if (typeof parameters[0] !== 'function') return parameters[0]

                let timer = parameters[1],
                    delay = 0,
                    forceInterval = false

                // Users can pass in an object as a second parameter instead
                if (typeof parameters[1] === 'object') {
                    if (parameters[1].hasOwnProperty('timer')) {
                        timer = parameters[1].timer
                    }

                    if (parameters[1].hasOwnProperty('delay')) {
                        delay = parameters[1].delay
                    }

                    if (parameters[1].hasOwnProperty('forceInterval')) {
                        forceInterval = parameters[1].forceInterval
                    }
                }

                let loop = () => {
                    const test = this.hasOwnProperty('autoIntervalTest') ? this.autoIntervalTest : true

                    setTimeout(() => {
                        if (!this.autoIntervalLoop) return
                        test && parameters[0].call(this)
                        forceInterval ? this.autoIntervalLoop() : requestAnimationFrame(this.autoIntervalLoop)
                    }, timer)
                }

                this.autoIntervalLoop = loop

                setTimeout(() => {
                    if (!this.autoIntervalLoop) return

                    forceInterval ? this.autoIntervalLoop() : requestAnimationFrame(this.autoIntervalLoop)
                }, delay)

                this.$watch('autoIntervalTest', test => {
                    if (test) {
                        this.autoIntervalLoop = loop

                        forceInterval ? this.autoIntervalLoop() : requestAnimationFrame(this.autoIntervalLoop)
                    } else {
                        clearTimeout(this.autoIntervalLoop)

                        this.autoIntervalLoop = null
                    }
                })
            }
        })
    }
}

const alpine = window.deferLoadingAlpine || ((alpine) => alpine())

window.deferLoadingAlpine = function (callback) {
    AlpineIntervalMagicMethod.start()

    alpine(callback)
}

export default AlpineIntervalMagicMethod
