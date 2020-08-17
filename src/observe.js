function registerObserveMagicMethod() {
    Alpine.addMagicProperty('observe', function ($el) {
        return (...parameters) => {
            // TODO: Set it up to work like $observe('.selector', functionToRun())
            // TODO: It should only work with other alpine components
            return parameters[0]
        }
    })
}

const alpine = window.deferLoadingAlpine || ((alpine) => alpine())
window.deferLoadingAlpine = function (callback) {
    registerObserveMagicMethod()
    alpine(callback)
}

export default registerObserveMagicMethod