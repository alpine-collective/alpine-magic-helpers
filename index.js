import registerIntervalMagicMethod from './src/interval.js'
import registerFetchMagicMethod from './src/fetch.js'
import registerObserveMagicMethod from './src/observe.js'
import registerTruncateMagicMethod from './src/truncate.js'


const alpine = window.deferLoadingAlpine || ((alpine) => alpine())
window.deferLoadingAlpine = function (callback) {
    registerIntervalMagicMethod()
    registerFetchMagicMethod()
    registerObserveMagicMethod()
    registerTruncateMagicMethod()
    alpine(callback)
}

export default { 
    registerIntervalMagicMethod,
    registerFetchMagicMethod,
    registerObserveMagicMethod,
    registerTruncateMagicMethod,
}