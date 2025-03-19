import type { LuaEngine, LuaFactory } from "wasmoon";
import { create_backend } from "../backend";
import { create_frontend } from "../frontend";

type HyperVisorWasmoon = {
    lua_engine: () => Promise<string>
    frontbus: {
        on: (key: string, func: unknown) => {}
    },
    frontend: Awaited<ReturnType<typeof create_frontend>>,
    backend: Awaited<ReturnType<typeof create_backend>>,
    vm:  {
        fengari: unknown,
        factory: LuaFactory,
        lua: LuaEngine
    },
}

async function prepare(hv: HyperVisorWasmoon, LuaFactory: new () => LuaFactory) {
    if (!LuaFactory || hv.vm.fengari) {
        return;
    }

    hv.vm.factory = new LuaFactory()
    hv.vm.lua = await hv.vm.factory.createEngine()
}

async function install(hv: HyperVisorWasmoon, _: any, LuaMultiReturn: { from: (arg0: number[]) => void; }) {
    if (!hv.vm.lua) {
        return;
    }

    for (const key in hv.backend) {
        hv.vm.lua.global.set(key, hv.backend[key])
    }

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

    await hv.vm.lua.doString(await hv.lua_engine())

    for (const key in hv.frontend) {
        hv.frontbus.on(key.replace(/^native_callback_/, ''), hv.vm.lua.global.get(key))
    }
}

async function startup(hv: {}) {

}

export default {
    prepare,
    install,
    startup
}