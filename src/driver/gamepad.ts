import { gamepad_trigger } from "../frontend/gamepad";

async function prepare(hv: {}) {
}

async function install(hv: {}) {

}

async function startup(hv: {frontbus: any}, keymap:  Parameters<typeof gamepad_trigger>[1]) {
    hv.frontbus.on('pad', gamepad_trigger((key, value) => hv.frontbus.emit('keyboard', key, value), keymap))
}

export default {
    prepare,
    install,
    startup
}
