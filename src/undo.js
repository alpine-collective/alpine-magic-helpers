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
            return function (propertiesToWatch) {
                // TODO: accept "something.nested"
                const initialComponentState = componentData($el)
                if (!Array.isArray(initialComponentState.__xhistory)) {
                    throw new Error('$track() requires adding the property `__xhistory: []`')
                }

                $el.__xc = $el.__xc ?? {}
                propertiesToWatch = propertiesToWatch ?? Object.keys(initialComponentState)

                $el.__xc.propertiesBeingWatched = Object.keys(initialComponentState)
                    .filter(key => propertiesToWatch.includes(key))
                    .filter(key => key !== '__xhistory')

                $el.__xc.initialComponentState = componentData($el, $el.__xc.propertiesBeingWatched)
                $el.__xc.previousComponentState = JSON.stringify($el.__xc.initialComponentState)

                updateOnMutation($el, () => {
                    const previous = JSON.parse($el.__xc.previousComponentState)
                    const fresh = JSON.parse(JSON.stringify(componentData($el, $el.__xc.propertiesBeingWatched)))
                    let changes = DeepDiff.diff(previous, fresh, true)
                    changes = changes ? changes.filter(change => $el.__xc.propertiesBeingWatched.includes(change.path.join('.'))) : []
                    if (changes.length) {
                        $el.__x.$data.__xhistory.push(changes)
                        $el.__xc.previousComponentState = JSON.stringify(fresh)
                        $el.__x.updateElements($el)
                    }
                })
            }
        })

        Alpine.addMagicProperty('undo', function ($el) {
            return function () {
                const diffs = $el.__x.$data.__xhistory.pop()
                let fresh = JSON.parse($el.__xc.previousComponentState)
                fresh = fresh ?? $el.__xc.initialComponentState

                diffs && diffs.forEach(diff => {
                    DeepDiff.revertChange(fresh, componentData($el, $el.__xc.propertiesBeingWatched), diff)
                })

                // This could probbaly be extracted to a utility method like updateComponentProperties()
                if (Object.keys(fresh).length) {
                    const newData = {}
                    Object.entries(fresh).forEach(item => {
                        newData[item[0]] = item[1]
                    })
                    $el.__x.$data = Object.assign($el.__x.$data, newData)
                }

                $el.__xc.previousComponentState = JSON.stringify(componentData($el, $el.__xc.propertiesBeingWatched))
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
