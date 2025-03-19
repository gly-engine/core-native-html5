import { create_frontend } from "../frontend"

async function prepare(hv: {}) {
}

async function install(hv: {}) {

}

async function startup(hv: {frontend: Awaited<ReturnType<typeof create_frontend>>}, cfg = {uptime: false}) {
    let uptime = performance.now()
    function tick() {
        let new_time = performance.now()
        const dt = cfg.uptime? new_time: (new_time - uptime)
        uptime = new_time
        hv.frontend.native_callback_loop(dt)
        hv.frontend.native_callback_draw()
        window.requestAnimationFrame(tick)
    }

    hv.frontend.native_callback_init()
    window.requestAnimationFrame(tick)
}

export default {
    prepare,
    install,
    startup
}
