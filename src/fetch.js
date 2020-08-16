import axios from 'axios'
function registerFetchMagicMethod() {
    Alpine.addMagicProperty('fetch', function ($el) {
        return (...parameters) => {
            if (typeof parameters[0] === 'string' && parameters[0].length) {
                return axios(parameters[0]).then(response => response.hasOwnProperty('data') ?  response.data : response)
            }
            if (typeof parameters[0] === 'object') {
                return axios(parameters[0])
            }
            return parameters[0]
        }
    })
}

const alpine = window.deferLoadingAlpine || ((alpine) => alpine())
window.deferLoadingAlpine = function (callback) {
    registerFetchMagicMethod()
    alpine(callback)
}

export default registerFetchMagicMethod