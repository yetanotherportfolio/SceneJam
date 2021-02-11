import Component from './base.js'

export default class SceneComp extends Component {
    constructor (ui) {
        super('.scene')
        this.ui = ui

        this.on('.scene-add', 'click', (ev) => {
            this.on_scene_add()
        })

        this.on('.scene-asset-add', 'click', (ev) => {
            this.on_scene_asset_add(ev.target)
        })

        this.on('.scene-asset', 'click', (ev) => {
            this.on_asset_click(
                ev.target.dataset.sceneid,
                ev.target.dataset.asset_id,
                ev.target.dataset.parent
            )
        })

        this.on('.scene-select', 'click', (ev) => {
            this.on_scene_click(ev.target.dataset.sceneid)
        })

        this.on('.scene-game-select', 'click', (ev) => {
            this.on_game_click()
        })
    }

    on_game_click () {
        this.ui.on_activate_game()
    }

    on_scene_click (scene_id) {
        this.ui.on_activate_scene(scene_id)
    }

    on_scene_add () {
        this.ui.add_scene()
    }

    on_scene_asset_add (elem) {
        const scene_id = elem.dataset.scene
        this.ui.add_asset_to_scene(scene_id)
    }

    on_asset_click (scene_id, asset_id, parent) {
        if (parent !== 'undefined') this.ui.on_activate_asset(scene_id, asset_id, parent)
        else this.ui.on_activate_asset(scene_id, asset_id)
    }

    get_assets (scene_id, obj, parent) {
        const assets = []
        for (const k in obj) {
            const children = this.get_assets(
                scene_id,
                obj[k].assets,
                obj[k].name
            )
            let children_txt = '<ul>'
            children_txt += children.map(asset_tpl).join('\n')
            children_txt += '</ul>'

            assets.push({
                scene: scene_id,
                id: obj[k].name,
                children: children_txt,
                parent: parent,
                selected: (
                    this.ui.property.scene_id === scene_id &&
                    this.ui.property.asset_id === obj[k].name
                )
            })
        }
        return assets
    }

    tpl () {
        let txt = ''
        const scene_ids = this.ui.sceneCfg.get_scene_names()
        for (const i in scene_ids) {
            const scene_id = scene_ids[i]
            const assets = this.get_assets(
                scene_id,
                this.ui.sceneCfg.get_scene(scene_id)
            )

            txt += scene_tpl(
                scene_id,
                assets.map(asset_tpl).join('\n')
            )
        }

        return scenes_tpl(txt)
    }
}

const asset_tpl = (asset) => {
    return `<li>
        <a
            href="#"
            data-sceneid="${asset.scene}"
            data-asset_id="${asset.id}"
            data-parent="${asset.parent}"
            class="scene-asset ${asset.selected ? 'scene-asset-selected' : ''}">${asset.id}</a>
        ${asset.children}
    </li>`
}

const scene_tpl = (scene_id, assets) => {
    return `<li><a href="#" class="scene-select" data-sceneid="${scene_id}">${scene_id}</a>
        <ul class="scene-list-scene">
            ${assets}
            <li><button data-scene="${scene_id}" class="scene-asset-add">+</button></li>
        </ul>
    </li>`
}

const scenes_tpl = (scenes) => {
    return `<a href="#" class="scene-game-select">game</a>
    <ul class="scene-list-game">
        ${scenes}
        <li><button class="scene-add">+</button></li>
    </ul>`
}
