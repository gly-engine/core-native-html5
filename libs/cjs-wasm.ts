import core_native_html5 from '../src/index.ts'
import { LuaFactory, LuaMultiReturn } from 'wasmoon'

document.addEventListener('DOMContentLoaded', async () => {
    window.gly = await core_native_html5()
        .set_el_canvas('#gameCanvas')
        .set_library('wasmoon')
        .set_library('fengari', fengari)
        .set_library('resize', {widescreen: true})
        .set_library('runtime')
        .set_library('keyboard')
        .set_engine('https://cdn.jsdelivr.net/npm/@gamely/gly-engine-lite')
        .set_game('https://raw.githubusercontent.com/gamelly/gly-engine/refs/heads/main/samples/pong/game.lua')
        .build()
})
