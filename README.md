# core-native-html5
create your own game-engine with just javascript

```js
const gly = core_native_html5(wasmoon)
    .set_unfocus_pause(true)
    .set_widescreen(true)
    .set_el_canvas('#my-game-canva')
    .set_el_debug('#output-message')
    .set_engine('engine.lua')
    .set_game('game.lua')
    .add_driver(core_native_html5().driver_input())
    .add_driver(core_native_html5().driver_tick())
    .build()
```
