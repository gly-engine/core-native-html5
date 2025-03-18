import { create_emiter, create_frontend, create_lua_code } from './frontend'
import { create_backend, create_canvas} from './backend'
import { get_driver } from './driver'
import { libI } from './type'

export default (() => {
    let cfg_engine: string | undefined
    let cfg_libs: Array<{driver: libI, args: unknown[]}> = []
    let cfg_canvas: HTMLCanvasElement | string | undefined

    const methods = () => ({
        set_engine: (engine_code: string) => {
            cfg_engine = engine_code
            return methods()
        },
        set_el_canvas: (canvas: HTMLCanvasElement | string) => {
            cfg_canvas = canvas
            return methods()
        },
        set_library: (type: string, ...args) => {
            cfg_libs.push({
                driver: get_driver(type),
                args: args
            })
            return methods()
        },
        build: async () => {
            const vm = {}
            const lua_engine = create_lua_code(cfg_engine)
            const canvas = create_canvas(cfg_canvas)
            const backend = create_backend(canvas)
            const frontbus = create_emiter()
            const frontend = create_frontend(frontbus)
            const hypervisor = {
                vm, lua_engine, backend, frontend, frontbus
            }

            await Promise.all(cfg_libs.map(lib => lib.driver.prepare(hypervisor, ...lib.args)));
            await Promise.all(cfg_libs.map(lib => lib.driver.install(hypervisor, ...lib.args)));
            await Promise.all(cfg_libs.map(lib => lib.driver.startup(hypervisor, ...lib.args)));

            return {
                backend, frontend
            }
        }
    })

    return () => methods()
})()
