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
        this.watcher = chokidar.watch(
            this.path
        ).on('all', (event, full_path) => {
            full_path = full_path.replaceAll('\\', '/')

            let short_path = ''
            if (full_path.indexOf(this.path) === 0) {
                if (this.path === full_path) return
                short_path = full_path.substr(this.path.length)

                if (short_path[0] === '/') short_path = short_path.substr(1)
            }

            if (event === 'unlink') {
                window.ui.directory.remove_file(short_path || full_path, false)
            } else if (event === 'unlinkDir') {
                window.ui.directory.remove_file(short_path || full_path, true)
            } else {
                window.ui.directory.add_file(
                    short_path || full_path, fs.lstatSync(full_path).isDirectory(), full_path
                )
            }
        })
    }

    update_path (new_path) {
        this.path = new_path
        this.startup = true
        window.ui.game.set_base_url('file://' + this.path)
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
