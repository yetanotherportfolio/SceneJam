import PropertyComp from './comp/property.js'
import SceneComp from './comp/scene.js'
import AssetComp from './comp/asset.js'
import TreeComp from './comp/tree.js'
import SceneConfig from './scene.js'
import Directory from './directory.js'
import Game from './canvas/game.js'
import init_watcher from './watcher.js'
import SaveState from './savestate.js'
import Gizmo from './gizmo/manager.js'

class UI {
    constructor () {
        // HTML Comp
        this.property = new PropertyComp(this) // list of props on the rights
        this.scene = new SceneComp(this) // the list of assets on the left
        this.tree = new TreeComp(this) // list of folders at bottom left
        this.asset = new AssetComp(this) // list of files bottom

        this.gizmo = new Gizmo(this)

        this.sceneCfg = new SceneConfig()
        this.directory = new Directory()

        this.save_state = new SaveState(this)

        this.scene_id = this.sceneCfg.get_scene_names()[0]

        this.scene.render()
        this.tree.render(this.directory.get_folders())
        this.asset.render('/', this.directory.get_files('/'))

        this.game = new Game(
            document.querySelector('.canvas canvas'),
            this
        )
    }

    on_dir_changed (path) {
        this.directory.clear()
        window.change_path(path)
        this.tree.render(this.directory.get_folders())
        this.asset.render('/', this.directory.get_files('/'))
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
        // when an asset is clicked on
        if (this.scene_id !== scene_id) {
            this.scene_id = scene_id
            this.game.restart()
        }
        // console.log('on_activate_asset', scene_id, asset_id, parent)

        const fullName = parent ? `${parent}-${asset_id}` : asset_id

        // deactivate if already active
        if (!this.property.asset_id) {
            this.gizmo.setMode('inactive', fullName)
        } else if (this.property.asset_id !== asset_id) {
            this.gizmo.setMode('move', fullName)
        } else if (!this.gizmo.setNextMode(fullName)) {
            this.property.asset_id = null
            this.property.render(this.scene_id, null)
            this.scene.render()
            return
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
        this.save_state.set_need_save()
        this.scene.render()

        this.gizmo.setMode('inactive', null)
        this.game.restart()
    }

    add_asset_to_container (scene_id, container_id) {
        this.sceneCfg.add_asset_to_container(scene_id, container_id, 'CHANGE ME')
        this.save_state.set_need_save()
        this.gizmo.setMode('inactive', null)
        this.scene.render()
        this.game.restart()
    }

    remove_asset_from_scene (scene_id, asset_id) {
        if (!this.sceneCfg.remove_asset(scene_id, asset_id)) {
            console.error('Could not remove asset, asset not found')
            return
        }
        this.scene.render()
        this.property.render(this.scene_id, null)

        if (scene_id === this.scene_id) {
            this.game.restart()
        }
    }

    remove_scene (scene_id) {
        this.sceneCfg.remove_scene(scene_id)
        this.save_state.set_need_save()
        this.scene.render()
    }

    update_asset_from_prop (scene_id, asset_id, prop, value, update_game) {
        const id = prop === 'name' ? value : asset_id
        // console.log(
        //     'update_asset_from_prop',
        //     id, scene_id, asset_id, prop, value, update_game,
        //     this.property.mf.values
        // )

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
        // console.log('update_asset', scene_id, asset_id, prop, value, update_game)

        this.save_state.set_need_save()
        const id = this.sceneCfg.update_asset(scene_id, asset_id, prop, value)
        if (id !== undefined) {
            this.property.render_asset(
                scene_id, asset_id,
                this.sceneCfg.get_asset(scene_id, asset_id)
            )

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
        this.save_state.set_need_save()
        this.game.restart()
    }

    update_game (prop, value) {
        this.sceneCfg.update_game_config(prop, value)
        this.save_state.set_need_save()
        this.game.restart()
    }

    add_scene () {
        this.scene_id = this.sceneCfg.add_scene('scene')
        this.save_state.set_need_save()

        this.scene.render()
        this.game.restart()
    }

    onPlayBtnPressed (form_name, dictIndex, name, elem, event) {
        const tween_name = this.property.mf.form[form_name].forms[dictIndex].values.name
        this.game.play_tween(this.property.asset_id, tween_name)
    }
}

function init () {
    // NW JS
    if (window.nw !== undefined) {
        const win = window.nw.Window.get()
        win.width = 980
        win.height = 715

        win.on('resize', (width, height) => {
            console.log('Win resized', width, height)
            window.ui.game.restart()
        })
        win.on('maximize', () => {
            console.log('Win maximize')
            window.ui.game.restart()
        })
        win.on('minimize', () => {
            console.log('Win minimize')
            window.ui.game.restart()
        })
    }

    window.ui = new UI()
    init_watcher()
}
init()
