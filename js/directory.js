const config = {}

// HACK for local testing

if (window.nw === undefined) {
    config['assets'] = {
        scene1: {
            images: [
                'image1.png',
                'image2.png',
                'image3.png'
            ],
            testui: [
                'bg.png',
                'playbtn.png',
                'star.png',
                'title.png'
            ],
            fishtest: [
                'boat.png',
                'fishgauge.png',
                'fishgaugebar.png',
                'fishtrail.png',
                'float.png',
                'floattrail.png',
                'hero.png',
                'linegauge.png',
                'linegaugebar.png',
                'water.png'
            ],
            Sounds: [
                'sound1.mp3',
                'sound2.mp3',
                'sound3.mp3'
            ],
            __: [
                'scene-stuff.json'
            ]
        },
        Sprites: [
            'sprites1.png',
            'sprites2.png',
            'sprites3.png'
        ],
        __: [
            'some-cfg.ini'
        ]
    }
}

export default class Directory {
    get_folders () {
        return config
    }

    get_files (folder) {
        const path = folder.substr(1).split('/')

        var dir = config
        for (const i in path) {
            if (path[i] === '') continue

            if (dir[path[i]] === undefined) {
                console.error('path not found', path[i], 'in', dir)
                break
            }
            dir = dir[path[i]]
        }

        if (dir.__ !== undefined) return dir.__
        else if (Array.isArray(dir)) return dir
        else return []
    }

    remove_file (path, is_dir) {
        const splitted = path.split('/')
        let _config = config

        for (const i in splitted) {
            const _i = parseInt(i, 10)
            const part = splitted[i]

            if (_i === splitted.length - 1) {

                if (Array.isArray(_config)) {
                    const j = _config.indexOf(part)
                    if (j >= 0) {
                        _config.splice(j, 1)
                    }
                } else {
                    if (is_dir) {
                        delete _config[part]
                    } else {
                        const j = _config.__.indexOf(part)
                        if (j >= 0) {
                            _config.__.splice(j, 1)
                        }
                    }
                }
            }

            _config = _config[part]
        }

        // TODO
        window.ui.on_data_changed()
    }

    add_file (path, is_dir) {
        const splitted = path.split('/')
        let _config = config

        for (const i in splitted) {
            const _i = parseInt(i, 10)
            const part = splitted[i]
            if (_config[part] === undefined) {
                if (_i === splitted.length - 2 && !is_dir) {
                    _config[part] = []
                } else if (_i === splitted.length - 1) {
                    if (is_dir) {
                        _config[part] = {}
                    } else {
                        if (Array.isArray(_config)) _config.push(part)
                        else {
                            if (_config.__ === undefined) _config.__ = []
                            _config.__.push(part)
                        }
                    }
                } else {
                    _config[part] = {}
                }
            }
            _config = _config[part]
        }

        // TODO
        window.ui.on_data_changed()
    }
}
