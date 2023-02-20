import MoveGizmo from './move.js'
import RotateGizmo from './rotate.js'

export default class Gizmo {
    constructor (ui) {
        this.ui = ui

        this.move = new MoveGizmo(this)
        this.rotate = new RotateGizmo(this)

        // modes: inactive, move, rotate, scale
        this.mode = 'inactive'
        this.lock = null // null -> no lock, otherwise string of the axis it's locked on
        this.target = null
        this.sprite = null
        this.offset = [0, 0]
    }

    isActive () {
        return this.mode !== 'inactive'
    }

    _setMode (mode, target) {
        let wasUpdated = false

        if (mode !== this.mode) {
            console.log('! SET MODE', mode, this.mode)

            this.mode = mode
            wasUpdated = true
        }

        if (target !== this.target) {
            this.target = target
            wasUpdated = true
        }

        return wasUpdated
    }

    setMode (mode, target) {
        switch (mode) {
        case 'inactive':
            this._setMode(mode, target)
            if (this.sprite !== null) {
                this.sprite.destroy()
                this.sprite = null
            }
            break
        case 'rotate':
        case 'scale':
        case 'move':
        {
            if (this._setMode(mode, target)) {
                const canBeUsed = this._callOnMode('canBeUsed')
                if (!canBeUsed) {
                    this.setMode('inactive', null)
                    break
                }

                console.log('SET MODE', mode, target)
                if (this.sprite === null) {
                    const position = this.getTargetPosition()
                    this.spawnGizmo(position[0], position[1])
                } else {
                    this._callOnMode(
                        'setArrowAngle',
                        this.sprite.getAt(1),
                        this.sprite.getAt(2)
                    )
                }
            }
            break
        }
        default:
            console.error('Invalid Gizmo mode')
        }
    }

    setNextMode (target) {
        switch (this.mode) {
        case 'inactive':
            this.setMode('move', target)
            return true
        case 'move':
            this.setMode('rotate', target)
            return true
        case 'rotate':
        case 'scale':
        default:
            this.setMode('inactive', null)
            return false
        }
    }

    spawnGizmo (x, y) {
        const scene = this.ui.game.get_scene()

        this.sprite = scene.add.container(x, y)

        const dragGizmo = scene.add.image(0, 0, 'editor-gizmo-center')
        dragGizmo.setInteractive({ cursor: 'pointer' })
        dragGizmo.setData('lock', null)
        dragGizmo.setData('offset', [0, 0])
        scene.input.setDraggable(dragGizmo)
        this.sprite.add(dragGizmo)

        const arrowVert = scene.add.image(0, -50, 'editor-gizmo-arrow')
        arrowVert.setInteractive({ cursor: 'pointer' })
        arrowVert.setData('lock', 'y')
        arrowVert.setData('offset', [arrowVert.x, arrowVert.y])
        scene.input.setDraggable(arrowVert)
        this.sprite.add(arrowVert)

        const arrowHor = scene.add.image(50, 0, 'editor-gizmo-arrow')
        arrowHor.setInteractive({ cursor: 'pointer' })
        arrowHor.setData('lock', 'x')
        arrowHor.setData('offset', [arrowHor.x, arrowHor.y])
        scene.input.setDraggable(arrowHor)
        this.sprite.add(arrowHor)

        this._callOnMode('setArrowAngle', arrowVert, arrowHor)
    }

    onDrag (gameObject, dragX, dragY) {
        this._callOnMode('onDrag', gameObject, dragX, dragY)
    }

    getTargetPosition (target) {
        if (target === undefined) target = this.getTarget()

        if (target.emitter) {
            return [
                target.emitter.x.propertyValue,
                target.emitter.y.propertyValue
            ]
        } else if (target.getCenter) {
            const center = target.getCenter()
            return [center.x, center.y]
        } else {
            return [target.x, target.y]
        }
    }

    getTarget () {
        const asset = this.ui.game.loaded[this.target]
        if (!asset) {
            console.error('Gizmo target not found', this.target)
            return
        }
        return asset
    }

    _callOnMode (fn, ...args) {
        if (this[this.mode] && this[this.mode][fn]) {
            return this[this.mode][fn](...args)
        }
    }

    updateCanvas () {
        if (!this.isActive()) return

        const position = this._callOnMode('getGizmoPoint')
        this.sprite.x = position[0]
        this.sprite.y = position[1]
    }
}
