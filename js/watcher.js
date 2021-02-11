class Watcher {
    constructor () {
        this.path = './assets'
        this.startup = true
        this.watcher = null
    }

    start () {
        // TODO
        setTimeout(() => {
            this.startup = false
        }, 1000)

        const chokidar = require('chokidar')
        const fs = require('fs')
        this.watcher = chokidar.watch(this.path).on('all', (event, path) => {
            //if (!this.startup) console.log('update', path, event)
            console.log(path, event)

            window.ui.directory.add_file(path, fs.lstatSync(path).isDirectory())
        })
    }

    update_path (new_path) {
        this.path = new_path
        this.startup = true
        this.watcher.close().then(() => {
            this.start()
        })
    }
}

var watcher = null

export default function init_watcher () {
    if (window.require === undefined) {
        console.info('Not watching local files, running in browser mode')
        return
    }

    watcher = new Watcher()
    watcher.start()
}

window.change_path = function (new_path) {
    watcher.update_path(new_path)
}
