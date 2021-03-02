function hash_code (s) {
    return s.split('').reduce(function (a, b) { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0)
}

function get_hash_key (cfg) {
    // return cfg.name + "" + hash_code("" + cfg.src)
    return cfg.name + '' + hash_code(JSON.stringify(cfg))
}

const Scene2Phaser = {
    load: function (cfg, scene) {
        if ((cfg.type === 'image' || cfg.type === 'particle') && cfg.src) {
            scene.load.image(
                get_hash_key(cfg),
                cfg.src
            )
            return true
        } else if (cfg.type === 'sprite' && cfg.src) {
            // https://photonstorm.github.io/phaser3-docs/Phaser.Types.Loader.FileTypes.html#.ImageFrameConfig
            const frame_cfg = { frameWidth: Number.MAX_VALUE }
            const _w = parseInt(cfg.width, 10)
            if (_w !== 0) {
                frame_cfg.frameWidth = _w
            }
            const _h = parseInt(cfg.height, 10)
            if (_h !== 0) {
                frame_cfg.frameHeight = _h
            }

            // https://photonstorm.github.io/phaser3-docs/Phaser.Loader.LoaderPlugin.html#spritesheet__anchor
            scene.load.spritesheet(
                get_hash_key(cfg),
                cfg.src,
                frame_cfg
            )
            return true
        } else if (cfg.type === 'container') {
            for (const i in cfg.assets) {
                this.load(cfg.assets[i], scene)
            }
            return true
        }

        return false
    },

    add: function (cfg, scene) {
        if (cfg.load_only) return

        let asset = null
        if (cfg.type === 'image') {
            asset = scene.add.image(cfg.x, cfg.y, get_hash_key(cfg))
        } else if (cfg.type === 'sprite') {
            asset = scene.add.sprite(cfg.x, cfg.y, get_hash_key(cfg))
        } else if (cfg.type === 'anchor') {
            asset = scene.add.image(cfg.x, cfg.y, 'editor-arrows')
        } else if (cfg.type === 'container') {
            asset = scene.add.container(cfg.x, cfg.y)
            for (const i in cfg.assets) {
                const _asset = this.add(cfg.assets[i], scene)
                asset.add([_asset])
            }
            // const bound = asset.getBounds()
            // asset.setSize(bound.width, bound.height)
        } else if (cfg.type === 'text') {
            asset = scene.add.text(cfg.x, cfg.y, cfg.text, cfg.style)
        } else if (cfg.type === 'particle') {
            asset = scene.add.particles(get_hash_key(cfg))

            const emiterParams = {
                x: cfg.x,
                y: cfg.y
            }
            Object.assign(emiterParams, cfg)
            Object.assign(emiterParams, cfg.params)

            asset.createEmitter(emiterParams)
        }

        if (asset) {
            if (cfg.type === 'anchor') {
                asset.setOrigin(0.5)
            } else if (asset.setOrigin !== undefined) {
                asset.setOrigin(
                    cfg.originX || 0,
                    cfg.originY || 0
                )
            }

            asset.flipX = cfg.flipX
            asset.flipY = cfg.flipY

            if (cfg.depth) asset.depth = cfg.depth
            if (cfg.scaleX !== undefined) asset.scaleX = cfg.scaleX
            if (cfg.scaleY !== undefined) asset.scaleY = cfg.scaleY
            if (cfg.alpha !== undefined) asset.alpha = cfg.alpha
            if (cfg.visible === false) asset.visible = false
            if (cfg.angle !== undefined) asset.angle = cfg.angle
            if (cfg.animations) {
                for (const anim_key in cfg.animations) {
                    const anim = cfg.animations[anim_key]

                    asset.anims.create({
                        key: anim_key,
                        frames: asset.anims.generateFrameNumbers(
                            get_hash_key(cfg),
                            // https://photonstorm.github.io/phaser3-docs/Phaser.Types.Animations.html#.GenerateFrameNumbers
                            {
                                frames: anim.frames
                            }
                        ),
                        frameRate: parseInt(anim.frameRate, 10),
                        repeat: parseInt(anim.repeat, 10)
                    })
                }

                if (cfg.start_anim !== undefined) {
                    const anim = asset.anims.get(cfg.start_anim)
                    if (anim && anim.frames.length) {
                        asset.play(cfg.start_anim)
                    }
                }
            }
            if (cfg.tweens) {
                asset.tweens = {}
                for (const tween_id in cfg.tweens) {
                    const tween_cfg = {}
                    Object.assign(tween_cfg, cfg.tweens[tween_id])
                    tween_cfg.targets = asset
                    tween_cfg[tween_cfg.param] = {}
                    if (!isNaN(tween_cfg.from)) tween_cfg[tween_cfg.param].from = tween_cfg.from
                    if (!isNaN(tween_cfg.to)) tween_cfg[tween_cfg.param].to = tween_cfg.to
                    asset.tweens[tween_id] = scene.tweens.add(tween_cfg)

                    if (cfg.start_tween !== tween_id) { asset.tweens[tween_id].stop() }
                }
            }
            // if (cfg.start_tween) {
            //     asset.tweens[cfg.start_tween].play()
            // }

            asset.asset_id = cfg.name
            asset.type = cfg.type
            return asset
        }
    },

    update: function (cfg, asset, prop) {
        if (asset.type === 'particle') {
            return true
        } else if (prop === 'x') asset.x = cfg.x
        else if (prop === 'y') asset.y = cfg.y
        else if (prop === 'depth') asset.depth = cfg.depth
        else if (prop === 'flipX') asset.flipX = cfg.flipX
        else if (prop === 'flipY') asset.flipY = cfg.flipY
        else if (prop === 'scaleX') asset.scaleX = cfg.scaleX
        else if (prop === 'scaleY') asset.scaleY = cfg.scaleY
        else if (prop === 'alpha') asset.alpha = cfg.alpha
        else if (prop === 'visible') asset.setVisible(cfg.visible)
        else if (prop === 'angle') asset.angle = cfg.angle
        else if (prop === 'start_anim') {
            if (cfg.start_anim) asset.play(cfg.start_anim)
            else asset.stop()
        } else if (prop === 'text') asset.text = cfg.text
        // https://photonstorm.github.io/phaser3-docs/Phaser.Types.GameObjects.Text.html#.TextStyle
        else if (prop === 'style') asset.setStyle(cfg.style)
        else if (prop === 'originX' || prop === 'originY') {
            asset.setOrigin(
                cfg.originX || 0,
                cfg.originY || 0
            )
        }
        return true
    }
}
export default Scene2Phaser
