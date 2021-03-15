import { checkForAlpine, parseHtmlAttribute } from './utils'

const DIRECTIVE = 'x-unsafe-html'

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
                const attrs = Array.from(el.attributes)
                    .filter((attr) => attr.name === DIRECTIVE)
                    .map(parseHtmlAttribute)

                attrs.forEach(({ type, value, modifiers, expression }) => {
                    el.innerHTML = component.evaluateReturnExpression(el, expression, extraVars)
                    nodeScriptReplace(el)
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
