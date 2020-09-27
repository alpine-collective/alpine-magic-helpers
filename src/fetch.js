import axios from 'axios'
import { checkForAlpine } from './utils'

const AlpineFetchMagicMethod = {
    start() {
        checkForAlpine()

        Alpine.addMagicProperty('fetch', function () {
            return (...parameters) => {
                if (typeof parameters[0] === 'string' && parameters[0].length) {
                    return axios.get(parameters[0]).then(response => Object.prototype.hasOwnProperty.call(response, 'data') ? response.data : response)
                }

                if (typeof parameters[0] === 'object') {
                    return axios(parameters[0])
                }

                return parameters[0]
            }
        })
    },
}

const alpine = window.deferLoadingAlpine || ((alpine) => alpine())

window.deferLoadingAlpine = function (callback) {
    AlpineFetchMagicMethod.start()

    alpine(callback)
}

export default AlpineFetchMagicMethod
