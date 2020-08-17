function registerTruncateMagicMethod() {
    Alpine.addMagicProperty('truncate', function ($el) {
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
            if (parameters[1].hasOwnProperty('ellipsis')) {
                ellipsis = parameters[1].ellipsis
            }

            // If words or characters is set, also check that they are truthy. Setting to 0, for example, shoudld show all
            if (parameters[1].hasOwnProperty('words') && parameters[1].words) {
                return parameters[0].split(" ").splice(0, parameters[1].words).join(" ") + ellipsis
            }
            if (parameters[1].hasOwnProperty('characters') && parameters[1].characters) {
                return parameters[0].slice(0, parameters[1]['characters']) + ellipsis
            }
            return parameters[0]
        }
    })
}

const alpine = window.deferLoadingAlpine || ((alpine) => alpine())
window.deferLoadingAlpine = function (callback) {
    registerTruncateMagicMethod()
    alpine(callback)
}

module.exports = registerTruncateMagicMethod