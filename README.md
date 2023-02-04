# SceneJam

Simple, engine agnostic, 2d scene editor.

Support:
 - placing elements in a 2d scene
 - configure sprite animations
 - configure tweens
 - setup game width/height
 - setup scenes background color

![Screenshot](/screenshots/0_0_1b.gif)

An example using the [Phaser Loader](https://github.com/yetanotherportfolio/SceneJamPhaserLib) can be found [here](https://github.com/yetanotherportfolio/SceneJamPhaserExample).


## RUN
using [NW.js](https://nwjs.io/)

$ nw .

## DEBUG in a web browser

$ npm run debug

## BUILD

$ npm run dist

## TODO

- Cookie cutter project starter
- Better asset container handling
- Documentation
- Video demo
- Rework changing working dir and import/export UX

## Note

The project is **very WIP**, but still kinda usable.

My goal is to make something that would help me/other save times during gamejams.


## TODO
- Save button
- Debug only flag for asset ( That don't even load it ?)
- make lib of game micro lib and use it here
- Global lint cleanup
- duplicate object button
- show thumbnail of stuff in bottom asset window
- particles, burst test btn
- particles, fix min can't be 0
- particles, add start as stopped btn
- fix not used prop still in json
- add blender style, drag on x or y axis keybind
    - Other blender style keybinds? scale and rotate
- select multiple asset and drag
- select multiple asset and (un)group keybind
- ctrl z/y
- gizmo ? Could be used to move containers
