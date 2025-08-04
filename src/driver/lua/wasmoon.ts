import type { LuaEngine, LuaFactory } from "wasmoon";
import { create_backend } from "../../backend";
import { create_frontend } from "../../frontend";

type HyperVisorWasmoon = {
    code: {
        engine: () => Promise<string>
    },
    frontbus: {
        on: (key: string, func: unknown) => {}
    },
    frontend: Awaited<ReturnType<typeof create_frontend>>,
    backend: Awaited<ReturnType<typeof create_backend>>,
    vm:  {
        wasmoon: LuaFactory,
        lua: LuaEngine
    },
}

async function prepare(hv: HyperVisorWasmoon, LuaFactory: new () => LuaFactory) {
    if (!LuaFactory || hv.vm.lua) {
        return;
    }

    // @ts-ignore
    hv.vm.lua = true
    hv.vm.wasmoon = new LuaFactory()
    hv.vm.lua = await hv.vm.wasmoon.createEngine()
}

async function install(hv: HyperVisorWasmoon, _: any, LuaMultiReturn: { from: (arg0: number[]) => void; }) {
    if (!hv.vm.wasmoon) {
        return;
    }

    for (const key in hv.backend) {
        hv.vm.lua.global.set(key, hv.backend[key])
    }

    hv.vm.lua.global.set('native_image_mensure', (src) => {
        return LuaMultiReturn.from(hv.backend.native_image_mensure(src))
    })

    hv.vm.lua.global.set('native_text_mensure', (text) => {
        return LuaMultiReturn.from(hv.backend.native_text_mensure(text))
    })

    hv.vm.lua.global.set('native_draw_text', (x, y, text) => {
        return LuaMultiReturn.from(hv.backend.native_draw_text(x, y, text))
    })

    hv.vm.lua.global.set('native_dict_poly', {
        poly: hv.backend.native_draw_poly,
        poly2: hv.backend.native_draw_poly
    })

    if (window.location.protocol == 'https:') {
        hv.vm.lua.global.set('native_http_force_protocol', 'https')
    }
    hv.vm.lua.global.set('native_http_has_ssl', true)
    hv.vm.lua.global.set('native_json_encode', JSON.stringify)
    hv.vm.lua.global.set('native_json_decode', JSON.parse)
    hv.vm.lua.global.set('native_base64_encode', atob)
    hv.vm.lua.global.set('native_base64_decode', btoa)

    await hv.vm.lua.doString(await hv.code.engine())

    for (const key in hv.frontend) {
        hv.frontbus.on(key.replace(/^native_callback_/, ''), hv.vm.lua.global.get(key))
    }
}

async function startup(hv: {}) {

}

async function destroy(hv: HyperVisorWasmoon) {
    if (hv.vm.wasmoon) {
        hv.vm.lua.global.close()
    }
}

export default {
    prepare,
    install,
    startup,
    destroy
}