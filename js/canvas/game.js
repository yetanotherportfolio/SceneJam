import Scene2Phaser from './scene2phaser.js'

export default class Game {
    constructor (canvas_elem, ui) {
        this.game = new window.Phaser.Game({
            type: window.Phaser.CANVAS,
            width: '100%',
            height: '100%',
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

        this.loaded = {}
        this.get_scene().scene.restart()
    }

    _add_loaded_asset (cfg, scene) {
        const asset = Scene2Phaser.add(cfg, scene)
        if (!asset) return

        this.loaded[cfg.name] = asset

        // TODO
        if (cfg.type !== 'container') {
            this.loaded[cfg.name].setInteractive({
                useHandCursor: true
            })
            scene.input.setDraggable(this.loaded[cfg.name])
        }

        this.loaded[cfg.name].on(
            'pointerdown',
            (pointer) => {
                /* this.ui.update_asset(
                    this.scene_id, cfg.name,
                    'name', cfg.name, false
                ) */
                this.ui.on_activate_asset(this.ui.scene_id, cfg.name)
            }
        )
    }

    on_asset_drag (pointer, gameObject, dragX, dragY) {
        gameObject.x = Math.ceil(dragX)
        gameObject.y = Math.ceil(dragY)
        this.ui.update_asset_from_game(
            this.ui.scene_id,
            gameObject.asset_id,
            {
                x: gameObject.x,
                y: gameObject.y
            }
        )
    }

    preload () {
        const scene = this.get_scene()
        scene.load.image('editor-arrows', 'assets/editor/arrows.svg')

        if (this.base_url) this.get_scene().load.setBaseURL(this.base_url)

        // XXX
        const game_conf = this.ui.sceneCfg.get_game_config()
        scene.scale.resize(game_conf.width, game_conf.height)

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
        for (const i in cfgs) {
            const cfg = cfgs[i]
            this._add_loaded_asset(cfg, scene)
        }

        scene.input.on(
            'drag',
            (pointer, gameObject, dragX, dragY) => {
                this.on_asset_drag(
                    pointer, gameObject,
                    dragX, dragY
                )
            }
        )
    }

    update () {}

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
}
