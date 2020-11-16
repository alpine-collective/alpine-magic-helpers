import { checkForAlpine } from './utils'

const AlpineClipboardMagicMethod = {
    start() {
        checkForAlpine()

        Alpine.addMagicProperty('clipboard', function () {
            return function (target) {
                let value = target

                if (typeof value !== 'string') {
                    try {
                        value = JSON.stringify(value)
                    } catch (e) {
                        console.warn(e)
                    }
                }

                const container = document.createElement('textarea')

                container.value = value
                container.setAttribute('readonly', '')
                container.style.cssText = 'position:fixed;pointer-events:none;z-index:-9999;opacity:0;'

                document.body.appendChild(container)

                if (navigator.userAgent && navigator.userAgent.match(/ipad|ipod|iphone/i)) {
                    container.contentEditable = true
                    container.readOnly = true

                    const range = document.createRange()

                    range.selectNodeContents(container)

                    const selection = window.getSelection()

                    selection.removeAllRanges()
                    selection.addRange(range)

                    container.setSelectionRange(0, 999999)
                } else {
                    container.select()
                }

                try {
                    document.execCommand('copy')
                } catch (e) {
                    console.warn(e)
                }

                document.body.removeChild(container)
            }
        })
    },
}

const alpine = window.deferLoadingAlpine || ((alpine) => alpine())

window.deferLoadingAlpine = function (callback) {
    AlpineClipboardMagicMethod.start()

    alpine(callback)
}

export default AlpineClipboardMagicMethod
