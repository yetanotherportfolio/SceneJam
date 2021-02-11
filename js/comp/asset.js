import Component from './base.js'

export default class AssetComp extends Component {
    constructor (ui) {
        super('.assets')
        this.ui = ui

        this.on('a.asset-name', 'click', (evt) => {
            this.on_name_click(evt.target)
        })
    }

    on_name_click (el) {
        this.ui.add_asset_to_scene(
            null,
            'image',
            el.dataset.assetpath + '/' + el.dataset.assetname
        )
    }

    asset_tpl (path, asset_name) {
        return `<li><a
            href="#"
            class="asset-name"
            data-assetpath="${path}"
            data-assetname="${asset_name}">${asset_name}</a></li>`
    }

    tpl (path, assets) {
        return `<ul>${assets.map((asset_name) => {
            return this.asset_tpl(path, asset_name)
        }).join('')}</ul>`
    }
}
