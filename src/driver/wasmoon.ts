

/*
 const factory = new LuaFactory()
    const engine_file = gly.engine.get()
    const lua = await factory.createEngine()
    const engine_response = await fetch(engine_file)
    const engine_lua = await engine_response.text()

    lua.global.set('native_media_bootstrap', gly.global.get('native_media_bootstrap'))
    lua.global.set('native_media_position', gly.global.get('native_media_position'))
    lua.global.set('native_media_resize', gly.global.get('native_media_resize'))
    lua.global.set('native_media_pause', gly.global.get('native_media_pause'))
    lua.global.set('native_media_load', gly.global.get('native_media_load'))
    lua.global.set('native_media_play', gly.global.get('native_media_play'))    
    lua.global.set('native_draw_start', gly.global.get('native_draw_start'))
    lua.global.set('native_draw_flush', gly.global.get('native_draw_flush'))
    lua.global.set('native_draw_clear', gly.global.get('native_draw_clear'))
    lua.global.set('native_draw_color', gly.global.get('native_draw_color'))
    lua.global.set('native_draw_rect', gly.global.get('native_draw_rect'))
    lua.global.set('native_draw_line', gly.global.get('native_draw_line'))
    lua.global.set('native_draw_image', gly.global.get('native_draw_image'))
    lua.global.set('native_draw_poly2', gly.global.get('native_draw_poly2'))
    lua.global.set('native_text_print', gly.global.get('native_text_print'))
    lua.global.set('native_text_font_size', gly.global.get('native_text_font_size'))
    lua.global.set('native_text_font_name', gly.global.get('native_text_font_name'))
    lua.global.set('native_text_font_default', gly.global.get('native_text_font_default'))
    lua.global.set('native_text_font_previous', gly.global.get('native_text_font_previous'))
    lua.global.set('native_text_mensure', (x, y, text) => {
        const native_draw_text = gly.global.get('native_text_mensure')
        return LuaMultiReturn.from(native_draw_text(x, y, text))
    })
    lua.global.set('native_system_get_language', gly.global.get('native_system_get_language'))
    lua.global.set('native_http_handler', gly.global.get('native_http_handler'))
    lua.global.set('native_http_has_ssl', true)
    lua.global.set('native_http_force_protocol', window.location.protocol == 'https:'? 'https': 'http')
    lua.global.set('native_json_encode', JSON.stringify)
    lua.global.set('native_json_decode', JSON.parse)
    lua.global.set('native_base64_encode', atob)
    lua.global.set('native_base64_decode', btoa)

    await lua.doString(engine_lua)

    gly.global.set('native_callback_init', lua.global.get('native_callback_init'))
    gly.global.set('native_callback_loop', lua.global.get('native_callback_loop'))
    gly.global.set('native_callback_draw', lua.global.get('native_callback_draw'))
    gly.global.set('native_callback_resize', lua.global.get('native_callback_resize'))
    gly.global.set('native_callback_keyboard', lua.global.get('native_callback_keyboard'))

    gly.error('stop, canvas, console')
    gly.init('#gameCanvas')

    if (typeof game_file === 'string' && !game_file.includes('\n')) {
        const game_response = await fetch(game_file)
        gly.load(await game_response.text())
    } else {
        gly.load(game_file)
    }
*/

import type { LuaEngine, LuaFactory } from "wasmoon";

type HyperVisorWasmoon = {
    lua_engine: () => Promise<string>
    frontbus: {
        on: (key: string, func: unknown) => {}
    },
    frontend: {},
    backend: {},
    vm:  {
        factory: LuaFactory,
        lua: LuaEngine
    }
}

async function prepare(hv: HyperVisorWasmoon, LuaFactory: new () => LuaFactory) {
    hv.vm.factory = new LuaFactory()
    hv.vm.lua = await hv.vm.factory.createEngine()
}

async function install(hv: HyperVisorWasmoon) {
    for (const key in hv.backend) {
        hv.vm.lua.global.set(key, hv.backend[key])
    }

    await hv.vm.lua.doString(await hv.lua_engine())

    for (const key in hv.frontend) {
        hv.frontbus.on(key.replace(/^native_callback_/, ''), hv.vm.lua.global.get(key))
    }
}

async function startup(engine: {}, ) {

}

export default {
    prepare,
    install,
    startup
}