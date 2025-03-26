import { keymap } from '../../presets.json'
import { create_frontend } from "../frontend";
import { keyboard_trigger } from "../frontend/keyboard";

async function prepare(hv: {}) {
}

async function install(hv: {}) {

}

async function startup(hv: {frontend: Awaited<ReturnType<typeof create_frontend>>}, keys: Parameters<typeof keyboard_trigger>[1]) {
    if (typeof keys != 'object') {
        keys = `${keys}` in keymap? keymap[keys as string]: keymap['default']
    }
    document.addEventListener('keydown', keyboard_trigger(hv.frontend.native_callback_keyboard, keys))
    document.addEventListener('keyup', keyboard_trigger(hv.frontend.native_callback_keyboard, keys))
}

export default {
    prepare,
    install,
    startup
}
