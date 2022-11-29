import Component from './base.js'

import MagicForm from '../form/form.js'
import templates from '../form/scene.js'

export default class PropertyComp extends Component {
    constructor (ui) {
        super('.property')
        this.ui = ui

        this.scene_id = null
        this.asset_id = null
        this.mf = null

        const selector = '.property-row-value input, .property-row-value textarea'
        this.on(selector, 'change', (ev) => {
            this.on_property_change(ev.target)
        })

        this.on('.property-remove', 'click', (ev) => {
            this.on_property_remove(ev.target)
        })

        this.on('.property-asset-up', 'click', (ev) => {
            this.on_property_reorder(ev.target, true)
        })

        this.on('.property-asset-down', 'click', (ev) => {
            this.on_property_reorder(ev.target, false)
        })

        this.on('.property-export', 'click', (ev) => {
            this.on_export()
        })

        this.on('.property-import', 'click', (ev) => {
            this.on_import()
        })
    }

    on_export () {
        this.elem.querySelector('.property-import-txt').innerHTML = this.ui.sceneCfg.to_json()
    }

    on_import () {
        if (confirm('Are you sure?')) {
            const import_raw = this.elem.querySelector('.property-import-txt').value
            this.ui.on_import(import_raw)
        }
    }

    on_property_change (el) {
        const value = el.value

        const prop = el.dataset.propname
        const scene_id = el.dataset.sceneid

        if (scene_id !== 'null') {
            this.ui.update_scene(scene_id, prop, value)
        } else {
            this.ui.update_game(prop, value)
        }
    }

    on_property_remove (el) {
        if (!confirm('Are you sure?')) {
            return
        }

        if (el.dataset.assetid) {
            this.ui.remove_asset_from_scene(
                el.dataset.sceneid, el.dataset.assetid
            )
        } else {
            this.ui.remove_scene(
                el.dataset.sceneid
            )
        }
    }

    on_property_reorder (el, is_up) {
        this.ui.reorder_asset(
            this.scene_id,
            this.asset_id,
            is_up
        )
    }

    render_asset (scene_id, asset_id, values) {
        this.scene_id = scene_id
        this.asset_id = asset_id

        if (this.mf) this.mf.reset()

        this.mf = new MagicForm(
            null, templates[values.type], 'assetprop',
            values, (k, v) => {
                this.ui.update_asset_from_prop(scene_id, asset_id, k, v)
            }
        )

        let form_txt = `<div class="property-path">game > ${scene_id} > ${asset_id}</div>`
        form_txt += this.mf.render()
        form_txt += `<button
            data-assetid="${asset_id}"
            data-sceneid="${scene_id}"
            class="property-remove">remove</button>`
        form_txt += `<button
            data-assetid="${asset_id}"
            data-sceneid="${scene_id}"
            class="property-asset-up">move up</button>`
        form_txt += `<button
            data-assetid="${asset_id}"
            data-sceneid="${scene_id}"
            class="property-asset-down">move down</button>`

        this.elem.innerHTML = form_txt

        this.mf.elem = this.elem
        this.mf.add_event_handlers()
        this._add_event_handlers()
    }

    get_properties (scene_id, obj) {
        const properties = []
        for (const k in obj) {
            let value = ''
            let input_type = ''
            if (typeof (obj[k]) === 'object') {
                value = JSON.stringify(obj[k]) // BLHE
                input_type = 'large'
            } else {
                value = obj[k]
                input_type = 'small'
            }

            properties.push({
                id: obj.name,
                scene_id,
                name: k,
                value,
                type: input_type
            })
        }
        return properties
    }

    render_scene (scene_id, obj) {
        this.scene_id = scene_id
        this.asset_id = null
        this.render(scene_id, null, obj)
    }

    render_game (obj) {
        this.scene_id = null
        this.asset_id = null
        this.render(null, null, obj)
    }

    tpl (scene_id, asset_id, obj) {
        const properties = this.get_properties(scene_id, obj)

        let path = 'game'
        let render_type = 'game'

        if (scene_id) {
            path += ' > ' + scene_id
            render_type = 'scene'
        }

        if (render_type === 'game') return game_prop_tpl(scene_id, asset_id, properties, path)
        if (render_type === 'scene') return scene_prop_tpl(scene_id, asset_id, properties, path)
    }
}

const property_input_tpl = (prop) => {
    if (prop.type === 'large') {
        return `<textarea
            type="text"
            class="input-small"
            data-isjson="true"
            data-assetid="${prop.id}"
            data-propname="${prop.name}"
            data-sceneid="${prop.scene_id}">${prop.value}</textarea>`
    } else {
        return `<input
            type="text"
            class="input-small"
            data-isjson="false"
            data-assetid="${prop.id}"
            data-propname="${prop.name}"
            data-sceneid="${prop.scene_id}"
            value="${String(prop.value).replaceAll('"', '&quot;')}" />`
    }
}

const property_tpl = (prop) => {
    return `<div class="property-row">
                <div class="property-row-cell property-row-name">${prop.name}</div>
                <div class="property-row-cell property-row-value">
                    ${property_input_tpl(prop)}
                </div>
            </div>`
}

const scene_prop_tpl = (scene_id, asset_id, vars, path) => {
    return `<div class="property-path">${path}</div>
        ${vars.map(property_tpl).join('\n')}
        <button
            data-sceneid="${scene_id}"
            class="property-remove">remove</button>`
}

const game_prop_tpl = (scene_id, asset_id, vars, path) => {
    return `<div class="property-path">${path}</div>
        ${vars.map(property_tpl).join('\n')}
        <hr/>
        <textarea class="property-import-txt"></textarea><br/>
        <button class="property-export">export</button>
        <button class="property-import">import</button>`
}
