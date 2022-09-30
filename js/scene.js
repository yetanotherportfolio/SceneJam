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
                    tweens: {
                        hide: {
                            name: "hide",
                            props: {
                                x: {
                                    param: "x",
                                    value: "600",
                                    ease: "Back.easeInOut",
                                }
                            },
                            loop: 0,
                            yoyo: false
                        }
                    },
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
                    name: "particle",
                    x: 201,
                    y: 419,
                    type: "particle",
                    src: "/assets/scene1/particle.png",
                    params: {
                        angle: {
                            param: "angle",
                            min: -80,
                            max: -100
                        },
                        speed: {
                            param: "speed",
                            min: 10,
                            max: 100
                        },
                        scale: {
                            param: "scale",
                            start: 0.8,
                            end: 0.1
                        }
                    },
                    frequency: 200
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
                // {
                //     name: 'container1',
                //     x: 55,
                //     y: 55,
                //     type: 'container'

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
                // }
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
            } else {
                const asset = this.get_asset_in_container(
                    scene,
                    name,
                    assets[i].name
                )
                if (asset) return asset
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

        return asset
    }

    add_asset_to_container (scene_id, container_id, asset_id, type, src) {
        const container = this.get_asset(scene_id, container_id)
        if (container === undefined) {
            console.error('Container not found', scene_id, container_id)
            return
        }

        const asset = {}
        Object.assign(asset, templates.base)
        asset.name = this.get_unique_asset_name(scene_id, asset_id)
        asset.parent = container_id

        if (!container.assets) container.assets = []
        container.assets.push(asset)

        if (type) {
            this.update_asset(scene_id, asset.name, 'type', type)
        }
        if (src) {
            this.update_asset(scene_id, asset.name, 'src', src)
        }
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

    reorder_from_list (arr, asset_id, is_up) {
        var index = -1
        var asset = null
        for (const i in arr) {
            if (arr[i].name === asset_id) {
                index = parseInt(i, 10)
                asset = arr[i]
                break
            }
        }

        if (asset === null || index === -1) return
        if (!is_up && index - 1 < 0) return
        if (is_up && index + 1 >= arr.length) return

        arr.splice(index, 1)
        arr.splice(is_up ? index + 1 : index - 1, 0, asset)
    }

    reorder_asset (scene_id, asset_id, is_up) {
        const asset = this.get_asset(scene_id, asset_id)
        if (asset === undefined) return false

        if (asset.parent !== undefined) {
            const container = this.get_asset(scene_id, asset.parent)
            return this.reorder_from_list(container.assets, asset_id, is_up)
        }
        return this.reorder_from_list(config.scenes[scene_id].assets, asset_id, is_up)
    }

    update_scene_config (scene_id, prop, value) {
        config.scenes[scene_id].config[prop] = value
    }

    update_game_config (prop, value) {
        config.game[prop] = value
    }

    remove_from_list (arr, name) {
        let index = -1
        for (const i in arr) {
            if (arr[i].name === name) {
                index = i
                break
            }
        }

        if (index >= 0) {
            arr.splice(index, 1)
            return true
        }

        return false
    }

    remove_asset (scene, name) {
        const asset = this.get_asset(scene, name)
        if (asset === undefined) return false

        if (asset.parent !== undefined) {
            const container = this.get_asset(scene, asset.parent)
            return this.remove_from_list(container.assets, name)
        }
        return this.remove_from_list(config.scenes[scene].assets, name)
    }

    remove_scene (scene_id) {
        delete config.scenes[scene_id]
    }
}
