import { create_engine } from './frontend/engine'
import { create_emiter, create_frontend, create_code } from './frontend'
import { create_backend, create_canvas} from './backend'
import { get_driver } from './driver'
import { libI } from './type'

export default (() => {
    let cfg_game: string | unknown
    let cfg_engine: string | undefined
    let cfg_libs: Array<{driver: libI, args: unknown[]}> = []
    let cfg_canvas: HTMLCanvasElement | string | undefined
    let cfg_rootel: HTMLElement | string | undefined

    const methods = (device: Window) => ({
        set_game: (game_code: string | unknown) => {
            cfg_game = game_code
            return methods(device)
        },
        set_engine: (engine_code: string) => {
            cfg_engine = engine_code
            return methods(device)
        },
        set_el_root: (element: HTMLElement | string) => {
            cfg_rootel = element
            return methods(device)
        },
        set_el_canvas: (canvas: HTMLCanvasElement | string) => {
            cfg_canvas = canvas
            return methods(device)
        },
        set_library: (type: string, ...args) => {
            cfg_libs.push({
                driver: get_driver(type),
                args: args
            })
            return methods(device)
        },
        build: async () => {
            const vm = {}
            const media_players = []
            const pause_reasons = {}
            const code = {
                game: (typeof cfg_game == 'string'? create_code('game.lua', cfg_game): cfg_game) as () => Promise<string>,
                engine: create_code('engine.lua', cfg_engine)
            }
            const canvas = create_canvas(cfg_canvas)
            const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
            const backend = create_backend(canvas, ctx, media_players)
            const frontbus = create_emiter()
            const frontend = await create_frontend(frontbus, code, canvas, pause_reasons)
            const hypervisor = {
                vm, code, backend, frontend, frontbus, pause_reasons, media_players
            }

            await Promise.all(cfg_libs.map(lib => lib.driver.prepare(hypervisor, ...lib.args)))
            await Promise.all(cfg_libs.map(lib => lib.driver.install(hypervisor, ...lib.args)))
            await Promise.all(cfg_libs.map(lib => lib.driver.startup(hypervisor, ...lib.args)))

            return create_engine(hypervisor as unknown as Parameters<typeof create_engine>[0], canvas, ctx)
        }
    })

    return (device = window) => methods(device)
})()
