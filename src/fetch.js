import axios from 'axios'
import { checkForAlpine } from './utils'

const AlpineFetchMagicMethod = {
    start() {
        checkForAlpine()

        Alpine.addMagicProperty('fetch', this.fetch.bind(null, null))
        Alpine.addMagicProperty('get', this.fetch.bind(null, 'get'))
        Alpine.addMagicProperty('post', this.fetch.bind(null, 'post'))
    },
    fetch(method) {
        return async (parameters, data) => {
            function findResponse(response) {
                return Object.prototype.hasOwnProperty.call(response, 'data') ? response.data : response
            }

            // Using $post or $get
            if (method) {
                return await axios({
                    url: parameters,
                    method: method,
                    [method === 'post' ? 'data' : 'params']: data,
                }).then(response => findResponse(response))
            }

            if (typeof parameters === 'string') {
                // Using $fetch('url')
                return await axios.get(parameters).then(response => findResponse(response))
            }

            // Using $fetch({ // axios config })
            return await axios(parameters)
        }
    },
}

const alpine = window.deferLoadingAlpine || ((alpine) => alpine())

window.deferLoadingAlpine = function (callback) {
    AlpineFetchMagicMethod.start()

    alpine(callback)
}

export default AlpineFetchMagicMethod
