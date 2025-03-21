import { create_frontend } from "../frontend"

async function prepare(hv: {}) {
}

async function install(hv: {}) {

}

async function startup(hv: {frontend: Awaited<ReturnType<typeof create_frontend>>}, cfg = {widescreen: true}) {
    const set_size = (device: Window) => {
        const width = device.innerWidth
        const height = device.innerHeight
        const widescreen = cfg.widescreen && height >= width
        hv.frontend.native_callback_resize(width, widescreen? height/2: height)
    }
    
    window.addEventListener("resize", (ev: Event) => set_size(ev.target as Window))
    set_size(window)
}

export default {
    prepare,
    install,
    startup
}
