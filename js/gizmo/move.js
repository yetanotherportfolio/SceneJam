export default class MoveGizmo {
    constructor (manager) {
        this.manager = manager
    }

    canBeUsed () {
        return true
    }

    getGizmoPoint () {
        return this.manager.getTargetPosition()
    }

    setArrowAngle (arrowVert, arrowHor) {
        arrowVert.angle = -90
        arrowHor.angle = 0
    }

    onDrag (gameObject, dragX, dragY) {
        const target = this.manager.getTarget()
        this.manager.lock = gameObject.getData('lock')
        this.manager.offset = gameObject.getData('offset')

        const gp = this.manager.getTargetPosition(target)
        const newPostion = (
            target.emitter
                ? [
                    Math.floor(dragX),
                    Math.floor(dragY)
                ]
                : [
                    Math.floor(dragX - (gp[0] - target.x)),
                    Math.floor(dragY - (gp[1] - target.y))
                ]
        )

        if (this.manager.lock === 'x') {
            newPostion[0] -= 50
            newPostion[1] = target.emitter ? target.emitter.y.propertyValue : target.y
        }
        if (this.manager.lock === 'y') {
            newPostion[0] = target.emitter ? target.emitter.x.propertyValue : target.x
            newPostion[1] += 50
        }

        // for particle emitter
        if (target.emitter && target.emitter.setPosition) {
            target.emitter.setPosition(newPostion[0], newPostion[1])
        } else {
            target.x = newPostion[0]
            target.y = newPostion[1]
        }

        this.manager.ui.update_asset_from_game(
            this.manager.ui.scene_id,
            target.asset_id,
            {
                x: target.x,
                y: target.y
            }
        )
    }
}
