import registerTruncateMagicMethod from './src/truncate.js'
import registerIntervalMagicMethod from './src/interval.js'
import registerFetchMagicMethod from './src/fetch.js'


const alpine = window.deferLoadingAlpine || ((alpine) => alpine())
window.deferLoadingAlpine = function (callback) {
    registerTruncateMagicMethod()
    registerIntervalMagicMethod()
    registerFetchMagicMethod()
    alpine(callback)
}

export default { registerTruncateMagicMethod, registerIntervalMagicMethod, registerFetchMagicMethod }