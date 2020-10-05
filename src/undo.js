import {
    checkForAlpine,
    componentData,
    updateOnMutation,
} from './utils'
import { DeepDiff } from 'deep-diff'

const AlpineUndoMagicMethod = {
    start() {
        checkForAlpine()
        Alpine.addMagicProperty('track', function ($el) {
            return function (_propertiesToWatch = []) {
                // TODO: Possibly scope to specific properties
                $el.changes = []
                $el.initialComponentState = componentData($el)
                $el.previousComponentState = JSON.stringify($el.initialComponentState)

                updateOnMutation($el, () => {
                    const previous = JSON.parse($el.previousComponentState)
                    const fresh = JSON.parse(JSON.stringify($el.__x.getUnobservedData()))
                    const changes = DeepDiff.diff(previous, fresh, true)
                    if (changes) {
                        $el.changes.push(changes)
                        $el.previousComponentState = JSON.stringify(fresh)
                        $el.__x.updateElements($el)
                    }
                })
            }
        })

        Alpine.addMagicProperty('undo', function ($el) {
            return function (data = []) {
                const diffs = $el.changes.pop()
                const fresh = JSON.parse($el.previousComponentState)
                if (!diffs || !Object.keys(fresh).length) return

                diffs.forEach(diff => {
                    DeepDiff.revertChange(fresh, $el.__x.getUnobservedData(), diff)
                })

                Object.keys(fresh).length && Object.entries(fresh).forEach(item => {
                    $el.__x.$data[item[0]] = item[1]
                })

                $el.previousComponentState = JSON.stringify($el.__x.getUnobservedData())
            }
        })
    },
}

const alpine = window.deferLoadingAlpine || ((alpine) => alpine())

window.deferLoadingAlpine = function (callback) {
    alpine(callback)

    AlpineUndoMagicMethod.start()
}

export default AlpineUndoMagicMethod
