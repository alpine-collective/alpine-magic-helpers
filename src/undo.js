import {
    checkForAlpine,
    componentData,
    updateOnMutation,
} from './utils'
import { DeepDiff } from 'deep-diff'

const AlpineUndoMagicMethod = {
    start() {
        checkForAlpine()

        Alpine.addMagicProperty('history', function ($el) {
            if ($el.__x && $el.__xc && $el.__x.__xc.__xhistory.length) {
                return $el.__x.__xc.__xhistory
            }
            return []
        })

        Alpine.addMagicProperty('track', function ($el) {
            return function (propertiesToWatch) {
                $el.__xc = $el.__xc ?? {}
                propertiesToWatch = propertiesToWatch ?? Object.keys(componentData($el))
                if (!Array.isArray(propertiesToWatch)) {
                    propertiesToWatch = [propertiesToWatch]
                }

                // These are computed on load once, so won't last when Alpine.clone() is called
                $el.__xc.propertiesBeingWatched = propertiesToWatch.filter(key => key !== '$history')
                $el.__xc.initialComponentState = componentData($el, $el.__xc.propertiesBeingWatched)
                $el.__xc.previousComponentState = JSON.stringify($el.__xc.initialComponentState)

                updateOnMutation($el, () => {
                    preserveState($el)
                    const previous = JSON.parse($el.__x.__xc.previousComponentState)
                    const fresh = JSON.parse(JSON.stringify(componentData($el, $el.__xc.propertiesBeingWatched)))
                    let changes = DeepDiff.diff(previous, fresh, true)
                    changes = changes ? changes.filter(change => {
                        // Filter down to the properties we want (top level only)
                        return $el.__xc.propertiesBeingWatched.some(prop => change.path.join('.').startsWith(prop))
                    }) : []
                    if (changes.length) {
                        $el.__x.__xc.__xhistory.push(changes)
                        $el.__x.__xc.previousComponentState = JSON.stringify(fresh)
                        $el.__x.updateElements($el)
                    }
                })
            }

            // If this isn't setup the information will get lost on Alpine.clone()
            function preserveState($el) {
                $el.__x.__xc = $el.__x.__xc ?? {}
                if (typeof $el.__x.__xc.__xhistory === 'undefined') {
                    $el.__x.__xc.__xhistory = []
                }
                if (typeof $el.__x.__xc.initialComponentState === 'undefined') {
                    $el.__x.__xc.initialComponentState = $el.__xc.initialComponentState
                }
                if (typeof $el.__x.__xc.previousComponentState === 'undefined') {
                    $el.__x.__xc.previousComponentState = $el.__xc.previousComponentState
                }
            }
        })

        Alpine.addMagicProperty('undo', function ($el) {
            return function () {
                const diffs = $el.__x.__xc.__xhistory.pop()
                let fresh = JSON.parse($el.__x.__xc.previousComponentState)
                fresh = fresh ?? $el.__x.__xc.initialComponentState

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

                $el.__x.__xc.previousComponentState = JSON.stringify(componentData($el, $el.__xc.propertiesBeingWatched))
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
