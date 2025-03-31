# core-native-html5

[![npm](https://img.shields.io/npm/dy/@gamely/core-native-html5?logo=npm&logoColor=fff&label=npm%20downloads)](https://www.npmjs.com/package/@gamely/core-native-html5)
[![cdn](https://img.shields.io/jsdelivr/npm/hy/@gamely/core-native-html5?logo=jsdelivr&logoColor=fff&label=cdn%20downloads)](https://www.jsdelivr.com/package/npm/@gamely/core-native-html5)

> create your own game-engine with just javascript or lua.

### Built-in Modules

| driver name     | description |
| :-------------- | :---------- |
| fengari         | lua vm in es6
| wasmoon         | lua vm in wasm
| keyboard        | inputs events
| gamepad         | inputs events
| runtime         | tick and draw events
| resize          | auto resize width and height 
| player-fake     | fake video player using html element `<canvas>`
| player-html5    | video player using html  element `<video>`
| player-videojs  | video player using videojs library
| player-youtube  | video player using iframe youtube integration
| fengari-check   | check for a lua virtual machine<br/>_(also `wasmoon-check` `fengari-or-wasmoon-check`)_
| fengari-jsonrxi | thirdy party library json for core native api<br/>_(use string: <https://cdn.jsdelivr.net/gh/rxi/json.lua/json.lua>)_

### Third-party Libraries

```html
<!-- fengari -->
<script src="https://cdn.jsdelivr.net/npm/fengari-web@latest/dist/fengari-web.min.js"></script>

<!-- wasmoon -->
<script type="module">
import { LuaFactory, LuaMultiReturn } from 'https://cdn.jsdelivr.net/npm/wasmoon@1.16.0/+esm'
window.LuaFactory = LuaFactory
window.LuaMultiReturn = LuaMultiReturn
</script>

<!-- videojs -->
<script src="https://cdn.jsdelivr.net/npm/video.js@8.22.0/dist/video.min.js"></script>
```

## Gly Engine

replace `@latest` with the engine version you want.

 * <https://www.npmjs.com/package/@gamely/gly-engine>
 * <https://www.npmjs.com/package/@gamely/gly-engine-lite>
 * <https://www.npmjs.com/package/@gamely/gly-engine-micro>

| version            | fengari | library configs |
| :----------------- | :-----: | :-------------- |
| `0.0.7`            |         | `'runtime'` `{uptime: true}`<br/>`'keyboard'` `'legacy'`
| `0.0.8` ~ `0.0.11` |         |
| `0.0.18` and newer | support |

```js
const gly = await core_native_html5()
    .set_el_root('main')
    .set_el_canvas('#gameCanvas')
    .set_library('wasmoon', LuaFactory, LuaMultiReturn)
    .set_library('runtime', {uptime: false})
    .set_library('keyboard')
    .set_library('resize')
    .set_engine('https://cdn.jsdelivr.net/npm/@gamely/gly-engine@latest/dist/main.lua')
    .set_game('game.lua')
    .build()
```

## Love2D

support wasmoon and fengari!

 * <https://www.npmjs.com/package/@gamely/love-engine>

```js
const keymap = [
    ['KeyZ', 'a'],
    ['KeyX', 'b'],
    ['KeyC', 'c'],
    ['KeyV', 'd'],
    ['Enter', 'a'],
    ['ArrowUp', 'up'],
    ['ArrowDown', 'down'],
    ['ArrowLeft', 'left'],
    ['ArrowRight', 'right'],
    ['ShiftLeft', 'menu'],
];

const gly = await core_native_html5()
    .set_el_root('main')
    .set_el_canvas('#gameCanvas')
    .set_library('fengari', fengari)
    .set_library('runtime', {unfocus_pause: true})
    .set_library('keyboard', keymap)
    .set_library('resize')
    .set_engine('https://cdn.jsdelivr.net/npm/@gamely/love-engine@latest/dist/main.lua')
    .set_game('main.lua')
    .build()
```

## Engine writen in lua

```js
const gly = await core_native_html5()
    .set_el_root('main')
    .set_el_canvas('#gameCanvas')
    .set_library('wasmoon', window.LuaFactory, window.LuaMultiReturn)
    .set_library('fengari', window.fengari)
    .set_library('fengari-jsonrxi', 'https://cdn.jsdelivr.net/gh/rxi/json.lua/json.lua')
    .set_library('fengari-or-wasmoon-check')
    .set_library('player-videojs', window.videojs)
    .set_library('runtime')
    .set_library('keyboard')
    .set_library('resize')
    .set_engine('engine.lua')
    .set_game('game.lua')
    .build()
```

## Baremetal javascript

```js
const gly = await core_native_html5()
    .set_el_canvas('#gameCanvas')
    .build()

gly.engine.on('draw', () => {
    gly.backend.native_draw_color(0xFFFFFFFFF)
    gly.backend.native_draw_rect(0, 50, 50, 50, 50)
})

function tick() {
    gly.frontend.native_callback_loop()
    gly.frontend.native_callback_draw()
    window.requestAnimationFrame(tick)
}

gly.frontend.native_callback_init()
tick();
```

## Custom engine javascript

```js
function awesome_game(loop, draw, keys) {
    let color = 0x00FFFFFF

    loop.callback(() => {

    })
    draw.callback(() => {
        draw.color(color)
        draw.rect(0, 10, 20, 30, 40)
    })
    keys.callback((key, press) => {
        if (key == 'a' && press) {
            color = 0xFF0000FF
        }
    })
}
```

```js
function awesome_engine(game) {
    core_native_html5().set_el_canvas('#game').set_library('keyboard').set_library('runtime').build().then((gly) => {
        const loop = {
            callback: (f) => gly.on('loop', f)
        }
        const draw = {
            color: gly.backend.native_draw_color,
            rect: gly.backend.native_draw_rect,
            callback: (f) => gly.on('draw', f)
        }
        const keys = {
            callback: (f) => gly.on('keyboard', f)
        }
    
        game(loop, draw, keys)
    })
}
```

```js
awesome_engine(awesome_game)
```
