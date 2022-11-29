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
        this.watcher = chokidar.watch(this.path)

        this.watcher
            .on('add', path => this.on_file_add(path))
            .on('change', path => this.on_file_update(path))
            .on('unlink', path => this.on_remove_file(path))
            .on('unlinkDir', path => this.on_remove_dir(path))
    }

    on_remove_file (full_path) {
        const short_path = this.get_short_pass(full_path)
        console.log('on_remove_file', short_path)

        window.ui.directory.remove_file(short_path || full_path, false)
    }

    on_remove_dir (full_path) {
        const short_path = this.get_short_pass(full_path)
        console.log('on_remove_dir', short_path)

        window.ui.directory.remove_file(short_path || full_path, true)
    }

    on_file_add (full_path) {
        const short_path = this.get_short_pass(full_path)
        console.log('on_file_add', short_path)

        const fs = require('fs')
        window.ui.directory.add_file(
            short_path || full_path,
            fs.lstatSync(full_path).isDirectory(),
            full_path
        )
    }

    on_file_update (full_path) {
        const short_path = this.get_short_pass(full_path)
        console.log('on_file_update', short_path)
        window.ui.game.restart()
    }

    get_short_pass (path) {
        const full_path = path.replaceAll('\\', '/')

        let short_path = ''
        if (full_path.indexOf(this.path) === 0) {
            if (this.path === full_path) return
            short_path = full_path.substring(this.path.length)
            if (short_path[0] === '/') short_path = short_path.substring(1)
        }
        return short_path
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

let watcher = null

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
