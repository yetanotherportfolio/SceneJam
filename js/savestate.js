export default class SaveState {
    is_loaded = false
    is_saved = true
    need_saved = false
    path = ''

    constructor (ui) {
        this.ui = ui

        document.addEventListener('keydown', (evt) => {
            this.on_keydown(evt)
        });
    }

    on_keydown (evt) {
        if (evt.key != 's' || !evt.ctrlKey) return

        this.save()
    }

    save () {
        if (!this.is_loaded || this.path === '') return

        const json = this.ui.sceneCfg.to_json()
        console.log("saving at", this.path)

        const fs = require('fs')
        fs.writeFile(this.path, json, err => {
            if (err) {
                console.error(err)
                return
            }

            this.is_saved = true
            this.need_saved = false

            this.on_save_done()
        })
    }

    set_need_save () {
        this.is_saved = false
        this.need_saved = true

        if (window.nw !== undefined) {
            var win = window.nw.Window.get()
            win.title = "* SceneJam"
        }
    }

    on_save_done () {
        if (window.nw !== undefined) {
            var win = window.nw.Window.get()
            win.title = "SceneJam"
        }
    }
}
