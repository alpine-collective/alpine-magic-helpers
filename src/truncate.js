import {
    checkForAlpine,
    importOrderCheck,
} from './utils'

importOrderCheck()

const AlpineTruncateMagicMethod = {
    start() {
        checkForAlpine()

        Alpine.addMagicProperty('truncate', () => {
            return (...parameters) => {
                if (typeof parameters[0] !== 'string') return parameters[0]

                // If the second parameter isn't truthy, return the full string
                if (!parameters[1]) return parameters[0]

                // if only a number or string is passed in, keep it simple
                if (typeof parameters[1] !== 'object') {
                    return this.appendEllipsis(parameters[0].slice(0, parameters[1]), parameters)
                }

                // If words or characters is set, also check that they are truthy. Setting to 0, for example, shoudld show all
                if (Object.prototype.hasOwnProperty.call(parameters[1], 'words') && parameters[1].words) {
                    return this.appendEllipsis(parameters[0].split(' ').splice(0, parameters[1].words).join(' '), parameters)
                }
                if (Object.prototype.hasOwnProperty.call(parameters[1], 'characters') && parameters[1].characters) {
                    return this.appendEllipsis(parameters[0].slice(0, parameters[1].characters), parameters)
                }
                return parameters[0]
            }
        })
    },
    appendEllipsis(string, parameters) {
        if (parameters[0].length <= string.length) return string
        let ellipsis = '…'
        // 3rd parameter is an optional '…' override (soon to be deprecated)
        if (typeof parameters[2] !== 'undefined') {
            ellipsis = parameters[2]
        }
        // If the second parameter is an object
        if (Object.prototype.hasOwnProperty.call(parameters[1], 'ellipsis')) {
            ellipsis = parameters[1].ellipsis
        }
        return string + ellipsis
    },
}

const alpine = window.deferLoadingAlpine || ((alpine) => alpine())

window.deferLoadingAlpine = function (callback) {
    AlpineTruncateMagicMethod.start()

    alpine(callback)
}

export default AlpineTruncateMagicMethod
