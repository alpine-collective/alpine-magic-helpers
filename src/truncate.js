function registerTruncateMagicMethod() {
    Alpine.addMagicProperty('truncate', function ($el) {
        return (...parameters) => {
            if (typeof parameters[0] !== 'string') return parameters[0]
            // if only a number or string is passed in, keep it simple
            if (typeof parameters[1] !== 'object') {
                return parameters[0].slice(0, parameters[1])
            }
            if (parameters[1].hasOwnProperty('words')) {
                return parameters[0].split(" ").splice(0, parameters[1].words).join(" ")
            }
            if (parameters[1].hasOwnProperty('characters')) {
                return parameters[0].slice(0, parameters[1]['characters'])
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