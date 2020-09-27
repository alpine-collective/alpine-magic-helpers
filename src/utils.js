export const checkForAlpine = () => {
    if (!window.Alpine) {
        throw new Error('[Magic Helpers] Alpine is required for the magic helpers to function correctly.')
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
