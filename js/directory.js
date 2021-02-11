const config = {
    assets: {
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
}
