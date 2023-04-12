
export default class RotateGizmo {
    constructor (manager) {
        this.manager = manager
    }

    canBeUsed () {
        const target = this.manager.getTarget()
        if (target === null || target === undefined) return false
        if (target.type === 'anchor') return false
        if (target.emitter) return false
        return true
    }

    getGizmoPoint () {
        const target = this.manager.getTarget()
        return [target.x, target.y]
    }

    setArrowAngle (arrowVert, arrowHor) {
        arrowVert.angle = 0
        arrowHor.angle = 90
    }

    onDrag (gameObject, dragX, dragY) {
        if (gameObject.type === 'anchor') return

        const target = this.manager.getTarget()
        if (target.emitter) return

        target.angle = Math.round(window.Phaser.Math.RadToDeg(window.Phaser.Math.Angle.Between(
            target.x,
            target.y,
            dragX,
            dragY
        )))

        this.manager.ui.update_asset_from_game(
            this.manager.ui.scene_id,
            target.asset_id,
            {
                angle: target.angle
            }
        )
    }
}
