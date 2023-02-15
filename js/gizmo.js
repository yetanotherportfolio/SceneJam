export default class Gizmo {
    constructor (ui) {
        this.ui = ui

        // modes: inactive, drag, rotate, scale
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
            console.log('! SET TARGET', target, this.target)

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
        case 'drag':
        case 'rotate':
        case 'scale':
        {
            const asset = this.ui.game.loaded[target]
            if (!asset || asset.type === 'anchor') {
                this.setMode('inactive', null)
                break
            }

            if (this._setMode(mode, target)) {
                console.log('SET MODE', mode, target)
                if (this.sprite === null) {
                    const position = this.getTargetPosition()
                    this.spawnGizmo(position[0], position[1])
                }
            }
            break
        }
        default:
            console.error('Invalid Gizmo mode')
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
        arrowVert.angle -= 90
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
    }

    onDrag (gameObject, dragX, dragY) {
        let target = null
        if (gameObject.type === 'anchor') {
            target = gameObject
            this.lock = null
            this.offset = [0, 0]
            this.setMode('inactive', null)
        } else {
            target = this.getTarget()
            this.lock = gameObject.getData('lock')
            this.offset = gameObject.getData('offset')
        }

        const newPostion = target.emitter ? [target.emitter.x.propertyValue, target.emitter.y.propertyValue] : [target.x, target.y]

        const w = target.width ? target.width : 0
        const h = target.height ? target.height : 0
        if (!this.lock || this.lock === 'x') newPostion[0] = Math.ceil(dragX - w / 2) - this.offset[0]
        if (!this.lock || this.lock === 'y') newPostion[1] = Math.ceil(dragY - h / 2) - this.offset[1]

        // for particle emitter
        if (target.emitter && target.emitter.setPosition) {
            target.emitter.setPosition(newPostion[0], newPostion[1])
        } else {
            target.x = newPostion[0]
            target.y = newPostion[1]
        }

        this.ui.update_asset_from_game(
            this.ui.scene_id,
            target.asset_id,
            {
                x: target.x,
                y: target.y
            }
        )
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

    updateCanvas () {
        if (!this.isActive()) return

        const position = this.getTargetPosition()
        this.sprite.x = position[0]
        this.sprite.y = position[1]
    }
}
