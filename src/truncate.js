import { checkForAlpine } from './utils'

const AlpineTruncateMagicMethod = {
    start() {
        checkForAlpine()

        Alpine.addMagicProperty('truncate', function () {
            return (...parameters) => {
                if (typeof parameters[0] !== 'string') return parameters[0]
                const originalText = parameters[0]
                let truncatedText
                let ellipsis = '…'

                // If the second parameter isn't truthy, return the full string
                if (!parameters[1]) return originalText

                // if only a number or string is passed in, keep it simple
                if (typeof parameters[1] !== 'object') {
                    if (typeof parameters[2] !== 'undefined') {
                        ellipsis = parameters[2]
                    }
                    truncatedText = originalText.slice(0, parameters[1])
                } else {
                    // Customize the …
                    if (Object.prototype.hasOwnProperty.call(parameters[1], 'ellipsis')) {
                        ellipsis = parameters[1].ellipsis
                    }

                    // If words or characters is set, also check that they are truthy.
                    // Setting to 0, for example, should show all
                    if (Object.prototype.hasOwnProperty.call(parameters[1], 'words') && parameters[1].words) {
                        truncatedText = originalText.split(' ').splice(0, parameters[1].words).join(' ')
                    } else if (Object.prototype.hasOwnProperty.call(parameters[1], 'characters') && parameters[1].characters) {
                        truncatedText = originalText.slice(0, parameters[1].characters)
                    } else {
                        truncatedText = originalText
                    }
                }

                // Only append the ellipsis if the text was truncated
                if (truncatedText.length < originalText.length) {
                    return truncatedText + ellipsis
                } else {
                    return truncatedText
                }
            }
        })
    },
}

const alpine = window.deferLoadingAlpine || ((alpine) => alpine())

window.deferLoadingAlpine = function (callback) {
    AlpineTruncateMagicMethod.start()

    alpine(callback)
}

export default AlpineTruncateMagicMethod
