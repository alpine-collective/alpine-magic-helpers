export const checkForAlpine = () => {
    if (!window.Alpine) {
        throw new Error('[Magic Helpers] Alpine is required for the magic helpers to function correctly.')
    }
    if (!window.Alpine.version || !isValidVersion('2.5.0', window.Alpine.version)) {
        throw new Error('Invalid Alpine version. Please use Alpine version 2.5.0 or above')
    }
}

export const saferEval = (expression, dataContext, additionalHelperVariables = {}) => {
    if (typeof expression === 'function') {
        return expression.call(dataContext)
    }

    // eslint-disable-next-line no-new-func
    return (new Function(['$data', ...Object.keys(additionalHelperVariables)], `var __alpine_result; with($data) { __alpine_result = ${expression} }; return __alpine_result`))(
        dataContext, ...Object.values(additionalHelperVariables),
    )
}

function isValidVersion(required, current) {
    const requiredArray = required.split('.')
    const currentArray = current.split('.')
    for (let i = 0; i < requiredArray.length; i++) {
        if (!currentArray[i] || parseInt(currentArray[i]) < parseInt(requiredArray[i])) {
            return false
        }
    }
    return true
}
