const config = {
    game: {
        width: 500,
        height: 500
    },
    scenes: {
        scene: {
            config: {
                background: '#fafafa'
            },
            assets: [
                {
                    name: 'tower',
                    x: 217,
                    y: 170,
                    type: 'image',
                    src: 'assets/scene1/images/image2.png',
                    flipX: false,
                    flipY: false,
                    scaleX: 1.0,
                    scaleY: 1.0,
                    alpha: 1.0,
                    angle: 0,
                    depth: 0,
                    originX: 0.0,
                    originY: 0.0
                },
                {
                    name: 'skeleton',
                    x: 169,
                    y: 416,
                    type: 'sprite',
                    src: 'assets/scene1/images/image3.png',
                    width: 64,
                    height: 64,
                    animations: {
                        idle: { name: 'idle', frames: [5], frameRate: 8, repeat: -1 },
                        walk: { name: 'walk', frames: [0, 1, 2, 3, 4], frameRate: 8, repeat: -1 },
                        run: { name: 'run', frames: [3, 4, 5], frameRate: 8, repeat: -1 }
                    },
                    start_anim: 'walk',
                    flipX: false,
                    flipY: false,
                    scaleX: 1.0,
                    scaleY: 1.0,
                    alpha: 1.0,
                    angle: 0,
                    depth: 0,
                    originX: 0.0,
                    originY: 0.0
                },
                {
                    name: 'container1',
                    x: 55,
                    y: 55,
                    type: 'anchor'

                    // assets: [
                    //     {
                    //         name: 'star1',
                    //         x: 0,
                    //         y: 0,
                    //         type: 'image',
                    //         src: 'assets/scene1/testui/star.png'
                    //     },
                    //     {
                    //         name: 'star2',
                    //         x: 250,
                    //         y: 150,
                    //         type: 'image',
                    //         src: 'assets/scene1/testui/star.png'
                    //     }
                    // ]

                    /* tweens: {
                        "show": {
                            name: "show",
                            param: "x",
                            "from": 100,
                            "to": 400,
                            ease: 'Bounce',
                            duration: 1000,
                            repeat: -1,
                            yoyo: false
                        },
                        "hide": {
                            name: "hide",
                            param: "x",
                            "from": 400,
                            "to": 100,
                            ease: 'Elastic',
                            duration: 1000,
                            repeat: 0,
                            yoyo: false
                        }
                    },
                    start_tween: "" */
                }
            ]
        }
    }
}

const templates = {
    base: {
        name: '',
        x: 0,
        y: 0,
        type: 'anchor',

        tweens: {},
        start_tween: ''

        // TODO: tween
        // https://photonstorm.github.io/phaser3-docs/Phaser.Types.Tweens.html#.TweenBuilderConfig
        // https://phaser.io/examples/v3/search?search=tween
        // https://rexrainbow.github.io/phaser3-rex-notes/docs/site/ease-function/
        // https://rexrainbow.github.io/phaser3-rex-notes/docs/site/tween/
    },
    anchor: {},
    displayable: {
        flipX: false,
        flipY: false,
        scaleX: 1.0,
        scaleY: 1.0,
        alpha: 1.0,
        angle: 0,
        depth: 0,
        originX: 0,
        originY: 0
    },
    text: {
        text: 'TEXT',
        style: {},
        depth: 0
    },
    image: {
        src: 'assets/editor/dead.svg'
    },
    sprite: {
        src: 'assets/editor/dead.svg',
        width: 0,
        height: 0,
        animations: {
            idle: { frames: [0], frameRate: 8, repeat: -1 }
        },
        start_anim: 'idle'
    }
}

export default class SceneConfig {
    to_json () {
        return JSON.stringify(config, null, 4)
    }

    from_json (raw) {
        const parsed = JSON.parse(raw)
        for (const k in parsed) {
            config[k] = parsed[k]
        }
    }

    get_game_config () {
        return config.game
    }

    get_scene_names () {
        return Object.keys(config.scenes)
    }

    get_scene (name) {
        return config.scenes[name].assets
    }

    get_scene_config (name) {
        return config.scenes[name].config
    }

    add_scene (_name) {
        const name = this.get_unique_scene_name(_name)

        config.scenes[name] = {
            config: {
                background: '#fff'
            },
            assets: []
        }

        return name
    }

    get_asset_in_container (scene, name, parent) {
        const assets = config.scenes[scene].assets
        for (const i in assets) {
            if (assets[i].name === parent) {
                const sub_assets = assets[i].assets
                for (const j in sub_assets) {
                    if (sub_assets[j].name === name) {
                        return sub_assets[j]
                    }
                }
            }
        }
    }

    get_asset (scene, name) {
        const assets = config.scenes[scene].assets
        for (const i in assets) {
            if (assets[i].name === name) {
                return assets[i]
            }
        }
    }

    get_unique_scene_name (scene_id) {
        let num = 0
        let name = ''
        do {
            name = scene_id
            if (num > 0) name += num
            num += 1
        } while (config.scenes[name] !== undefined)
        return name
    }

    get_unique_asset_name (scene_id, asset_id) {
        let num = 0
        let name = ''
        do {
            name = asset_id
            if (num > 0) name += num
            num += 1
        } while (this.get_asset(scene_id, name))
        return name
    }

    add_asset (scene_id, asset_id, type, src) {
        const asset = {}
        Object.assign(asset, templates.base)
        asset.name = this.get_unique_asset_name(scene_id, asset_id)
        config.scenes[scene_id].assets.push(asset)

        if (type) {
            this.update_asset(scene_id, asset.name, 'type', type)
        }
        if (src) {
            this.update_asset(scene_id, asset.name, 'src', src)
        }

        console.log(asset.name, scene_id, asset.name, type, src)
        return asset
    }

    _apply_prop (asset, tpl) {
        for (const prop in tpl) {
            if (asset[prop] === undefined) {
                asset[prop] = tpl[prop]
            }
        }
    }

    update_asset_type (asset, new_type) {
        this._apply_prop(asset, templates[new_type])

        if (new_type !== 'anchor') {
            this._apply_prop(asset, templates.displayable)
        } else {
            for (const prop in templates.displayable) {
                if (asset[prop] !== undefined) {
                    delete asset[prop]
                }
            }
        }

        for (const prop in templates[asset.type]) {
            console.log(new_type, templates[new_type])
            if (templates[new_type][prop] === undefined && templates.base[prop] === undefined) {
                delete asset[prop]
            }
        }
        asset.type = new_type
    }

    update_asset (scene, asset_id, prop, value) {
        const asset = this.get_asset(scene, asset_id)
        if (asset === undefined) return

        if (prop === 'type') {
            this.update_asset_type(asset, value)
        } else {
            asset[prop] = value
        }

        return asset.name
    }

    reorder_asset (scene_id, asset_id, is_up) {
        const assets = config.scenes[scene_id].assets
        var index = -1
        var asset = null
        for (const i in assets) {
            if (assets[i].name === asset_id) {
                index = parseInt(i, 10)
                asset = assets[i]
                break
            }
        }

        if (asset === null || index === -1) return
        if (!is_up && index - 1 < 0) return
        if (is_up && index + 1 >= assets.length) return

        assets.splice(index, 1)
        assets.splice(is_up ? index + 1 : index - 1, 0, asset)
    }

    update_scene_config (scene_id, prop, value) {
        config.scenes[scene_id].config[prop] = value
    }

    update_game_config (prop, value) {
        config.game[prop] = value
    }

    remove_asset (scene, name) {
        const assets = config.scenes[scene].assets
        let index = -1
        for (const i in assets) {
            if (assets[i].name === name) {
                index = i
                break
            }
        }

        if (index >= 0) {
            assets.splice(index, 1)
            return true
        }

        return false
    }

    remove_scene (scene_id) {
        delete config.scenes[scene_id]
    }
}
