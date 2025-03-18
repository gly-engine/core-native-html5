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

async function startup(hv: {}) {

}

export default {
    prepare,
    install,
    startup
}