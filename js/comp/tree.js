import Component from './base.js'

export default class TreeComp extends Component {
    constructor (ui) {
        super('.tree')
        this.ui = ui

        this.on('a.tree-name', 'click', (ev) => {
            this.on_name_click(ev.target)
        })

        this.on('.tree-dir', 'change', (ev) => {
            this.on_dir_changed(ev.target)
        })
    }

    on_dir_changed (el) {
        if (el.files.length === 0) {
            console.log('NO files selected')
            return
        }

        this.ui.on_dir_changed(el.files[0].path)
    }

    on_name_click (el) {
        this.ui.on_directory_change(
            el.dataset.dirname,
            el.dataset.dirpath
        )
    }

    _render (obj, path) {
        var str = ''
        for (const k in obj) {
            if (k === '__') {
                continue
            }

            if (Array.isArray(obj[k])) {
                str += folder_tpl(k, path)
            } else {
                str += tree_tpl(
                    k,
                    this._render(
                        obj[k],
                        path + '/' + k
                    ), path
                )
            }
        }
        return str
    }

    tpl (obj) {
        let tpl = this._render(obj, '')
        if (window.nw !== undefined) {
            tpl = '<input type="file" class="tree-dir" nwdirectory nwworkingdir="./assets">' + tpl
        }
        return tpl
    }
}

const key_name = (name, path) => {
    return `<a
            href="#"
            data-dirname="${name}"
            data-dirpath="${path}"
            class="tree-name">${name}</a>`
}

const folder_tpl = (name, path) => {
    return `<li>${key_name(name, path)}</li>`
}

const tree_tpl = (name, content, path) => {
    return `<li>${key_name(name, path)}: <ul>${content}</ul></li>`
}
