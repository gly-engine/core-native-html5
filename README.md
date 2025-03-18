# core-native-html5
create your own game-engine with just javascript or lua.

### Engine writen in lua

```js
const gly = await core_native_html5()
    .set_el_root('main')
    .set_el_canvas('#gameCanvas')
    .set_library('wasmoon', LuaFactory, LuaMultiReturn)
    .set_library('fengari', fengari)
    .set_library('fengari-rxi', 'rxi.lua')
    .set_library('fengari-or-wasmoon-check')
    .set_library('videojs', videojs)
    .set_library('runtime')
    .set_library('keyboard')
    .set_engine('engine.lua')
    .set_game('game.lua')
    .build()
```

### Engine writen in javascript

```js
const gly = await core_native_html5()
    .set_el_canvas('#gameCanvas')
    .set_library('runtime')
    .set_library('keyboard')
    .build()
```
