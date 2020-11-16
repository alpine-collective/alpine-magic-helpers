import { checkForAlpine } from './utils'

const AlpineTruncateMagicMethod = {
    start() {
        checkForAlpine()

        Alpine.addMagicProperty('truncate', () => {
            return (...parameters) => {
                if (typeof parameters[0] !== 'string') return parameters[0]
                let ellipsis = '…'

                // If the second parameter isn't truthy, return the full string
                if (!parameters[1]) return parameters[0]

                // if only a number or string is passed in, keep it simple
                if (typeof parameters[1] !== 'object') {
                    if (typeof parameters[2] !== 'undefined') {
                        ellipsis = parameters[2]
                    }
                    return parameters[0].slice(0, parameters[1]) + ellipsis
                }

                // Customize the …
                if (Object.prototype.hasOwnProperty.call(parameters[1], 'ellipsis')) {
                    ellipsis = parameters[1].ellipsis
                }

                // If words or characters is set, also check that they are truthy. Setting to 0, for example, shoudld show all
                if (Object.prototype.hasOwnProperty.call(parameters[1], 'words') && parameters[1].words) {
                    return parameters[0].split(' ').splice(0, parameters[1].words).join(' ') + ellipsis
                }
                if (Object.prototype.hasOwnProperty.call(parameters[1], 'characters') && parameters[1].characters) {
                    return parameters[0].slice(0, parameters[1].characters) + ellipsis
                }
                return parameters[0]
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
