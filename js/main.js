import PropertyComp from './comp/property.js'
import SceneComp from './comp/scene.js'
import AssetComp from './comp/asset.js'
import TreeComp from './comp/tree.js'
import SceneConfig from './scene.js'
import Directory from './directory.js'
import Game from './canvas/game.js'
import init_watcher from './watcher.js'

class UI {
    constructor () {
        this.property = new PropertyComp(this)
        this.scene = new SceneComp(this)
        this.tree = new TreeComp(this)
        this.asset = new AssetComp(this)

        this.sceneCfg = new SceneConfig()
        this.directory = new Directory()

        this.scene_id = this.sceneCfg.get_scene_names()[0]

        // this.property.render(this.scene_id, this.sceneCfg.get_asset(this.scene_id, "Asset1"))
        this.scene.render()
        this.tree.render(this.directory.get_folders())
        this.asset.render('/', this.directory.get_files('/'))

        this.game = new Game(
            document.querySelector('.canvas canvas'),
            this
        )
        // this.game.update_scene(this.sceneCfg.get_scene(this.scene_id))
    }

    on_data_changed () {
        this.tree.render(this.directory.get_folders())
        this.asset.render('/', this.directory.get_files('/'))
    }

    on_directory_change (dirname, dirpath) {
        const full_path = dirpath + '/' + dirname
        this.asset.render(
            full_path,
            this.directory.get_files(
                full_path
            )
        )
    }

    on_activate_asset (scene_id, asset_id, parent) {
        if (this.scene_id !== scene_id) {
            this.scene_id = scene_id
            this.game.restart()
        }

        if (parent) {
            this.property.render_asset(
                scene_id, asset_id,
                this.sceneCfg.get_asset_in_container(
                    scene_id, asset_id, parent
                )
            )
        } else {
            this.property.render_asset(
                scene_id, asset_id,
                this.sceneCfg.get_asset(scene_id, asset_id)
            )
        }
        this.scene.render()
    }

    on_activate_scene (scene_id) {
        if (this.scene_id !== scene_id) {
            this.scene_id = scene_id
            this.game.restart()
        }

        this.property.render_scene(
            scene_id,
            this.sceneCfg.get_scene_config(scene_id)
        )
        this.scene.render()
    }

    on_activate_game () {
        this.property.render_game(
            this.sceneCfg.get_game_config()
        )
        this.scene.render()
    }

    on_import (new_cfg) {
        this.sceneCfg.from_json(new_cfg)

        this.scene_id = this.sceneCfg.get_scene_names()[0]

        this.on_activate_game()
        this.game.restart()
    }

    reorder_asset (scene_id, asset_id, is_up) {
        this.sceneCfg.reorder_asset(scene_id, asset_id, is_up)

        this.property.render_asset(
            scene_id, asset_id,
            this.sceneCfg.get_asset(scene_id, asset_id)
        )
        this.scene.render()

        this.game.restart()
    }

    add_asset_to_scene (scene_id, type, src) {
        let asset_id = 'CHANGE ME'
        if (src) {
            const paths = src.split('/')
            const filename = paths[paths.length - 1].split('.')
            filename.pop()
            asset_id = filename.join('.')
        }

        this.sceneCfg.add_asset(scene_id || this.scene_id, asset_id, type, src)
        this.scene.render()

        this.game.restart()
    }

    remove_asset_from_scene (scene_id, asset_id) {
        this.sceneCfg.remove_asset(scene_id, asset_id)
        this.scene.render()
        this.property.render(this.scene_id, null)

        if (scene_id === this.scene_id) {
            this.game.restart()
        }
    }

    remove_scene (scene_id) {
        console.log('remove scene', scene_id)
        this.sceneCfg.remove_scene(scene_id)
        // TODO
        this.scene.render()
    }

    update_asset_from_prop (scene_id, asset_id, prop, value, update_game) {
        const id = prop === 'name' ? value : asset_id

        if (prop === 'type' || prop === 'name') {
            this.on_activate_asset(scene_id, id)
            this.property.mf.update_values()
        }

        this.scene.render()

        if (scene_id === this.scene_id && update_game !== false) {
            this.game.update_asset(asset_id, id, prop)
        }
    }

    update_asset (scene_id, asset_id, prop, value, update_game) {
        const id = this.sceneCfg.update_asset(scene_id, asset_id, prop, value)
        if (id !== undefined) {
            this.on_activate_asset(scene_id, id)
            this.scene.render()

            if (scene_id === this.scene_id && update_game !== false) {
                this.game.update_asset(asset_id, id, prop)
            }
        }
    }

    update_asset_from_game (scene_id, asset_id, values) {
        for (const prop in values) {
            this.update_asset(
                scene_id, asset_id,
                prop, values[prop],
                false
            )
        }
    }

    update_scene (scene_id, prop, value) {
        this.sceneCfg.update_scene_config(scene_id, prop, value)
        this.game.restart()
    }

    update_game (prop, value) {
        this.sceneCfg.update_game_config(prop, value)
        this.game.restart()
    }

    add_scene () {
        this.scene_id = this.sceneCfg.add_scene('scene')

        this.scene.render()
        this.game.restart()
    }
}

function init () {
    // NW JS
    if (window.nw !== undefined) {
        var win = window.nw.Window.get()
        win.width = 980
        win.height = 715
    }

    window.ui = new UI()
    init_watcher()
}
init()
