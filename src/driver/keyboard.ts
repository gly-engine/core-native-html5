import { create_frontend } from "../frontend";
import { keyboard_trigger } from "../frontend/keyboard";

async function prepare(hv: {}) {
}

async function install(hv: {}) {

}

async function startup(hv: {frontend: Awaited<ReturnType<typeof create_frontend>>}, keymap: [] | undefined) {  
    document.addEventListener('keydown', keyboard_trigger(hv.frontend.native_callback_keyboard, keymap))
    document.addEventListener('keyup', keyboard_trigger(hv.frontend.native_callback_keyboard, keymap))
}

export default {
    prepare,
    install,
    startup
}
