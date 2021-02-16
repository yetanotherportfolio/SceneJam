import { Field, FieldChoice, FieldBool, FieldNumBool, FieldJSON, FieldDict } from './field.js'

const EaseTypes = [
    'Linear',
    'Power0', 'Power1', 'Power2', 'Power3', 'Power4',
    'Quad', 'Cubic', 'Quart', 'Quint',
    'Sine', 'Expo',
    'Circ', 'Elastic',
    'Back', 'Bounce', 'Stepped',
    'Quad.easeIn', 'Cubic.easeIn', 'Quart.easeIn', 'Quint.easeIn', 'Sine.easeIn',
    'Expo.easeIn', 'Circ.easeIn', 'Back.easeIn', 'Bounce.easeIn', 'Quad.easeOut',
    'Cubic.easeOut', 'Quart.easeOut', 'Quint.easeOut', 'Sine.easeOut', 'Expo.easeOut',
    'Circ.easeOut', 'Back.easeOut', 'Bounce.easeOut', 'Quad.easeInOut', 'Cubic.easeInOut',
    'Quart.easeInOut', 'Quint.easeInOut', 'Sine.easeInOut', 'Expo.easeInOut', 'Circ.easeInOut',
    'Back.easeInOut', 'Bounce.easeInOut'
]

const ParticleParams = [
    'x', 'y',
    'moveToX', 'moveToY',
    'angle',
    'scale', 'scaleX', 'scaleY',
    'alpha',
    'lifespan',
    'speed', 'speedX', 'speedY',
    'gravityX:', 'gravityY',
    'accelerationX', 'accelerationY',
    'quantity',
    'rotate'
]

var templates = {
    anchor: {},
    container: {},
    text: {
        text: new Field('text', {}, 'TEXT', true),
        style: new FieldJSON({}, { color: '#ff0000' }, true),
        depth: new Field('number', {}, 0)
    },
    image: {
        src: new Field('text', {}, 'assets/editor/dead.svg', true)
    },

    // https://rexrainbow.github.io/phaser3-rex-notes/docs/site/particles/
    particle: {
        src: new Field('text', {}, 'assets/editor/dead.svg', true),
        // emiter: new FieldJSON({}, {"speed": 20, "accelerationY": 300}, true),
        params: new FieldDict({
            param: new FieldChoice({}, ParticleParams),
            min: new Field('number', { step: 0.01 }),
            max: new Field('number', { step: 0.01 }),
            start: new Field('number', { step: 0.01 }),
            end: new Field('number', { step: 0.01 }),
            steps: new Field('number', { step: 0.01 })
        }, 'param'),
        blendMode: new FieldChoice({}, Object.keys(window.Phaser.BlendModes)),
        frequency: new Field('number', { min: -1 }, 200, true),
        maxParticles: new Field('number'),
        reserve: new Field('number')
    },
    sprite: {
        src: new Field('text', {}, 'assets/editor/dead.svg'),
        width: new Field('number', {}, 0),
        height: new Field('number', {}, 0),
        animations: new FieldDict({
            name: new Field('text', { required: true }),
            frames: new FieldJSON({}, [0]),
            frameRate: new Field('number', { min: 0 }, 8),
            repeat: new FieldNumBool()
        }, 'name'),
        start_anim: new Field('text', {}, '')
    }
    // TODO: https://photonstorm.github.io/phaser3-docs/Phaser.GameObjects.Container.html
}

const AssetTypes = Object.keys(templates)

const basics = {
    base: {
        name: new Field(),
        x: new Field('number', {}, 50, true),
        y: new Field('number', {}, 50, true),
        type: new FieldChoice({}, AssetTypes),

        // TODO use multi props
        tweens: new FieldDict({
            name: new Field('text', { required: true }),
            param: new Field(),
            from: new Field('number', { step: 0.01 }),
            to: new Field('number', { step: 0.01 }),
            ease: new FieldChoice({}, EaseTypes),
            duration: new Field('number', { min: 0 }, 1000),
            loop: new FieldNumBool(),
            yoyo: new FieldBool({}, false)
        }, 'name'),
        start_tween: new Field()

        // TODO: tween
        // https://photonstorm.github.io/phaser3-docs/Phaser.Types.Tweens.html#.TweenBuilderConfig
        // https://phaser.io/examples/v3/search?search=tween
        // https://rexrainbow.github.io/phaser3-rex-notes/docs/site/ease-function/
        // https://rexrainbow.github.io/phaser3-rex-notes/docs/site/tween/
    },
    displayable: {
        flipX: new FieldBool({}, false),
        flipY: new FieldBool({}, false),
        scaleX: new Field('number', { min: 0, max: 1, step: 0.001 }, 1.0),
        scaleY: new Field('number', { min: 0, max: 1, step: 0.001 }, 1.0),
        alpha: new Field('number', { min: 0, max: 1, step: 0.001 }, 1.0),
        angle: new Field('number', {}, 0),
        depth: new Field('number', {}, 0),
        originX: new Field('number', { min: 0, max: 1, step: 0.1 }, 0.0),
        originY: new Field('number', { min: 0, max: 1, step: 0.1 }, 0.0)
    }
}

function update_templates () {
    for (const type in templates) {
        apply_prop(basics.base, templates[type])

        if (type !== 'anchor') {
            apply_prop(basics.displayable, templates[type])
        }
    }
}
update_templates()

function apply_prop (src, dst) {
    for (const prop in src) {
        dst[prop] = src[prop].copy()
    }
}

export default templates
