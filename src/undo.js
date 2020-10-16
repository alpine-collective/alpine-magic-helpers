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
            if ($el.__x) {
                $el.__x.$data.__xc = $el.__x.$data.__xc ?? {}
                return $el.__x.$data.__xc.history.length ? $el.__x.$data.__xc.history : []
            }
            return []
        })

        Alpine.addMagicProperty('track', function ($el) {
            return function (propertiesToWatch) {
                $el.__xc = $el.__xc ?? {}
                propertiesToWatch = propertiesToWatch ?? Object.keys(componentData($el))

                // These are computed on load once, so won't last when Alpine.clone() is called
                propertiesToWatch = Array.isArray(propertiesToWatch) ? propertiesToWatch : [propertiesToWatch]
                $el.__xc.propertiesBeingWatched = propertiesToWatch.filter(key => key !== '__xc')
                $el.__xc.initialComponentState = componentData($el, $el.__xc.propertiesBeingWatched)
                $el.__xc.previousComponentState = JSON.stringify($el.__xc.initialComponentState)

                updateOnMutation($el, () => {
                    preserveState($el)
                    const previous = JSON.parse($el.__x.$data.__xc.previousComponentState)
                    const fresh = JSON.parse(JSON.stringify(componentData($el, $el.__x.$data.__xc.propertiesBeingWatched)))
                    let changes = DeepDiff.diff(previous, fresh, true)
                    changes = changes ? changes.filter(change => {
                        // Filter down to the properties we want (top level only)
                        return $el.__x.$data.__xc.propertiesBeingWatched.some(prop => change.path.join('.').startsWith(prop))
                    }) : []
                    if (changes.length) {
                        $el.__x.$data.__xc.history.push(changes)
                        $el.__x.$data.__xc.previousComponentState = JSON.stringify(fresh)
                        $el.__x.updateElements($el)
                    }
                })
            }

            // If this isn't setup the information will get lost on Alpine.clone()
            function preserveState($el) {
                $el.__x.$data.__xc = $el.__x.$data.__xc ?? {}
                if (typeof $el.__x.$data.__xc.history === 'undefined') {
                    $el.__x.$data.__xc.history = []
                }
                if (typeof $el.__x.$data.__xc.initialComponentState === 'undefined') {
                    $el.__x.$data.__xc.initialComponentState = $el.__xc.initialComponentState
                }
                if (typeof $el.__x.$data.__xc.previousComponentState === 'undefined') {
                    $el.__x.$data.__xc.previousComponentState = $el.__xc.previousComponentState
                }
                if (typeof $el.__x.$data.__xc.propertiesBeingWatched === 'undefined') {
                    $el.__x.$data.__xc.propertiesBeingWatched = $el.__xc.propertiesBeingWatched
                }
            }
        })

        Alpine.addMagicProperty('undo', function ($el) {
            return function () {
                const diffs = $el.__x.$data.__xc.history.pop()
                let fresh = JSON.parse($el.__x.$data.__xc.previousComponentState)
                fresh = fresh ?? $el.__x.$data.__xc.initialComponentState

                diffs && diffs.forEach(diff => {
                    DeepDiff.revertChange(fresh, componentData($el, $el.__x.$data.__xc.propertiesBeingWatched), diff)
                })

                // This could probbaly be extracted to a utility method like updateComponentProperties()
                if (Object.keys(fresh).length) {
                    const newData = {}
                    Object.entries(fresh).forEach(item => {
                        newData[item[0]] = item[1]
                    })
                    $el.__x.$data = Object.assign($el.__x.$data, newData)
                }

                $el.__x.$data.__xc.previousComponentState = JSON.stringify(componentData($el, $el.__x.$data.__xc.propertiesBeingWatched))
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
