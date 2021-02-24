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
            path = path.replaceAll('\\', '/')

            if (event === 'unlink') {
                window.ui.directory.remove_file(path, false)
            } else if (event === 'unlinkDir') {
                window.ui.directory.remove_file(path, true)
            } else {
                window.ui.directory.add_file(path, fs.lstatSync(path).isDirectory())
            }
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
