import Scene2Phaser from './scene2phaser.js'

export default class Game {
    constructor (canvas_elem, ui) {
        this.restart_count = 0
        this.game = new window.Phaser.Game({
            type: window.Phaser.CANVAS,
            scale: {
                mode: window.Phaser.Scale.NONE,
                width: 500,
                height: 500
            },
            canvas: canvas_elem,
            scene: {
                preload: () => {
                    this.preload()
                },
                create: () => {
                    this.create()
                },
                update: () => {
                    this.update()
                }
            }
        })

        this.loaded = {}
        this.ui = ui
        this.base_url = ''
    }

    set_base_url (url) {
        this.base_url = url
        this.get_scene().load.setBaseURL(this.base_url)
    }

    get_scene () {
        return this.game.scene.scenes[0]
    }

    restart () {
        console.log('RESTARTING')
        this.restart_count += 1

        this.loaded = {}
        const scene = this.get_scene()
        if (scene) {
            scene.scene.restart()
        }
    }

    _add_loaded_asset (cfg, scene, gameCfg) {
        const asset = Scene2Phaser.add(cfg, scene, gameCfg)
        if (!asset) return

        this.loaded[cfg.name] = asset

        // TODO
        if (cfg.type === 'container') {
            for (const i in asset.list) {
                const subAsset = asset.list[i]
                subAsset.name = `${cfg.name}-${subAsset.asset_id}`
                this.loaded[subAsset.name] = subAsset
            }
            console.log(this.loaded)
        } else {
            this.loaded[cfg.name].setInteractive({
                useHandCursor: true
            })
            this.loaded[cfg.name].name = cfg.name

            // drag will be handle by gizmo
            if (cfg.type === 'anchor') {
                scene.input.setDraggable(this.loaded[cfg.name])
            }
        }

        this.loaded[cfg.name].on(
            'pointerdown',
            (pointer) => {
                this.ui.on_activate_asset(this.ui.scene_id, cfg.name)
            }
        )
    }

    preload () {
        const scene = this.get_scene()
        scene.load.image('editor-arrows', 'assets/editor/arrows.svg')
        scene.load.image('editor-gizmo-center', 'assets/editor/gizmo-center.svg')
        scene.load.image('editor-gizmo-arrow', 'assets/editor/gizmo-arrow.svg')

        if (this.base_url) this.get_scene().load.setBaseURL(this.base_url)

        // get available size
        const maxW = scene.scale.canvas.parentNode.offsetWidth - 4
        const maxH = scene.scale.canvas.parentNode.offsetHeight - 4

        // check if smaller than max
        const game_conf = this.ui.sceneCfg.get_game_config()
        const w = parseInt(game_conf.width)
        const h = parseInt(game_conf.height)
        if (w <= maxW && h <= maxH) {
            scene.scale.setGameSize(w, h)
            scene.scale.setZoom(1)
        } else { // if not, zoom out
            scene.scale.setGameSize(game_conf.width, game_conf.height)
            if (w > h) { scene.scale.setZoom(1 / (w / maxW)) } else { scene.scale.setZoom(1 / (h / maxH)) }
        }

        // XXX
        const scene_conf = this.ui.sceneCfg.get_scene_config(this.ui.scene_id)
        scene.cameras.main.setBackgroundColor(scene_conf.background)

        this.load_assets(
            this.ui.sceneCfg.get_scene(this.ui.scene_id)
        )
    }

    create () {
        const scene = this.get_scene()
        const cfgs = this.ui.sceneCfg.get_scene(this.ui.scene_id)
        const gameCfg = this.ui.sceneCfg.get_game_config()

        for (const i in cfgs) {
            const cfg = cfgs[i]
            this._add_loaded_asset(cfg, scene, gameCfg)
        }

        scene.input.on(
            'drag',
            (pointer, gameObject, dragX, dragY) => {
                this.ui.gizmo.onDrag(gameObject, pointer.x, pointer.y)
            }
        )
    }

    update () {
        this.ui.gizmo.updateCanvas()
    }

    update_asset (old_asset_id, new_asset_id, prop) {
        const cfg = this.ui.sceneCfg.get_asset(
            this.ui.scene_id, new_asset_id
        )

        const asset = this.loaded[old_asset_id]
        if (asset === undefined) {
            this.restart()
            return
        }

        if (old_asset_id !== new_asset_id) {
            delete this.loaded[old_asset_id]
            this.loaded[new_asset_id] = asset
        }

        if (Scene2Phaser.update(cfg, asset, prop)) {
            this.restart()
        }
    }

    load_asset (cfg) {
        Scene2Phaser.load(cfg, this.get_scene())
    }

    load_assets (scene_cfg) {
        for (const i in scene_cfg) {
            const cfg = scene_cfg[i]

            // if (!cfg.src) continue
            this.load_asset(cfg)
        }
    }

    remove_asset_from_scene (asset_id) {
        if (this.loaded[asset_id] !== undefined) {
            this.loaded[asset_id].destroy()
            delete this.loaded[asset_id]
        }
    }

    remove_scene () {}

    play_tween (asset_id, tween_id) {
        this.loaded[asset_id].tweens[tween_id].play()
    }
}
