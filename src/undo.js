import {
    checkForAlpine,
    componentData,
    updateOnMutation,
} from './utils'
import { DeepDiff } from 'deep-diff'

const history = new WeakMap()

const AlpineUndoMagicMethod = {
    start() {
        checkForAlpine()

        Alpine.addMagicProperty('track', ($el) => {
            return (propertiesToWatch) => {
                propertiesToWatch = propertiesToWatch ?? Object.keys(componentData($el))
                propertiesToWatch = Array.isArray(propertiesToWatch) ? propertiesToWatch : [propertiesToWatch]
                const initialState = JSON.stringify(componentData($el, propertiesToWatch))

                updateOnMutation($el, () => {
                    history.has($el.__x) || this.store($el, {
                        props: propertiesToWatch,
                        previous: initialState,
                    })
                    const fresh = componentData($el, history.get($el.__x).props)
                    const previous = JSON.parse(history.get($el.__x).previous)

                    let changes = DeepDiff.diff(previous, fresh, true)
                    if (changes && changes.length) {
                        changes = changes.filter(change => {
                            return history.get($el.__x).props.some(prop => change.path.join('.').startsWith(prop))
                        })
                        history.get($el.__x).previous = JSON.stringify(fresh)
                        history.get($el.__x).changes.push(changes)
                        $el.__x.updateElements($el)
                    }
                })
            }
        })

        Alpine.addMagicProperty('undo', ($el, $clone) => {
            return () => {
                if ($el !== $clone) {
                    this.store($clone, {
                        clone: true,
                        props: history.get($el.__x).props,
                        previous: history.get($el.__x).previous,
                        changes: history.get($el.__x).changes,
                    })
                    $el = $clone
                }

                const changes = history.get($el.__x).changes.pop()
                const previous = JSON.parse(history.get($el.__x).previous)
                changes && changes.forEach(change => {
                    DeepDiff.revertChange(
                        previous,
                        componentData($el, history.get($el.__x).props),
                        change,
                    )
                })

                // This could probbaly be extracted to a utility method like updateComponentProperties()
                if (Object.keys(previous).length) {
                    const newData = {}
                    Object.entries(previous).forEach(item => {
                        newData[item[0]] = item[1]
                    })
                    $el.__x.$data = Object.assign($el.__x.$data, newData)
                }

                history.get($el.__x).previous = JSON.stringify(componentData($el, history.get($el.__x).props))
            }
        })

        Alpine.addMagicProperty('history', ($previous, $new) => {
            if (!$new.__x) return []
            if ($previous !== $new) {
                this.store($new, {
                    clone: true,
                    props: history.get($previous.__x).props,
                    previous: history.get($previous.__x).previous,
                    changes: history.get($previous.__x).changes,
                })
            }
            return history.has($new.__x) ? history.get($new.__x) : []
        })
    },
    store($el, $state) {
        history.set($el.__x, Object.assign({
            clone: false,
            changes: [],
            get length() {
                return this.changes.length
            },
        }, $state))
        return history.get($el.__x)
    },
}

const alpine = window.deferLoadingAlpine || ((alpine) => alpine())

window.deferLoadingAlpine = function (callback) {
    alpine(callback)

    AlpineUndoMagicMethod.start()
}

export default AlpineUndoMagicMethod
