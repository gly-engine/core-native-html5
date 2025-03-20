import { pause, resume } from "../frontend/pause"
import { create_frontend } from "../frontend"

type HyperVisorRuntime = {
    frontend: Awaited<ReturnType<typeof create_frontend>>,
    pause_reasons: Record<string, boolean>
}

async function prepare(hv: {}) {
}

async function install(hv: {}) {

}

async function startup(hv: HyperVisorRuntime, cfg = {uptime: false, unfocus_pause: false}) {
    let uptime = performance.now()
    function tick() {
        let new_time = performance.now()
        const dt = cfg.uptime? new_time: (new_time - uptime)
        uptime = new_time
        hv.frontend.native_callback_loop(dt)
        hv.frontend.native_callback_draw()
        window.requestAnimationFrame(tick)
    }

    if (cfg.unfocus_pause) {
        window.addEventListener('blur', () => pause(hv.pause_reasons, 'focus'))
        window.addEventListener('focus', () => resume(hv.pause_reasons, 'focus'))
    }

    hv.frontend.native_callback_init()
    window.requestAnimationFrame(tick)
}

export default {
    prepare,
    install,
    startup
}
