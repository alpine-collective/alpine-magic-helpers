import { checkForAlpine, getXDirectives } from './utils'

const DIRECTIVE = 'unsafe-html'

const nodeScriptClone = function (node) {
    const script = document.createElement('script')
    script.text = node.innerHTML

    for (let i = 0; i < node.attributes.length; i++) {
        const attr = node.attributes[i]
        script.setAttribute(attr.name, attr.value)
    }

    return script
}

const nodeScriptReplace = function (node) {
    if (node.tagName && node.tagName.toLowerCase() === 'script') {
        node.parentNode.replaceChild(nodeScriptClone(node), node)
    } else {
        for (let i = 0; i < node.childNodes.length; i++) {
            nodeScriptReplace(node.childNodes[i])
        }
    }
    return node
}

const AlpineUnsafeHTMLCustomDirective = {
    start() {
        checkForAlpine()

        Alpine.onBeforeComponentInitialized((component) => {
            const legacyResolveBoundAttributes = component.resolveBoundAttributes

            component.resolveBoundAttributes = function (el, initialUpdate = false, extraVars) {
                const attrs = getXDirectives(el)

                attrs.forEach(({ type, value, modifiers, expression }) => {
                    if (type === DIRECTIVE) {
                        el.innerHTML = component.evaluateReturnExpression(el, expression, extraVars)
                        nodeScriptReplace(el)
                    }
                })

                return legacyResolveBoundAttributes.bind(component)(el, initialUpdate, extraVars)
            }
        })
    },
}

const alpine = window.deferLoadingAlpine || ((alpine) => alpine())

window.deferLoadingAlpine = function (callback) {
    AlpineUnsafeHTMLCustomDirective.start()

    alpine(callback)
}

export default AlpineUnsafeHTMLCustomDirective
