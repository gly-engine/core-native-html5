import { padmap } from '../../presets.json'
import { gamepad_trigger } from "../frontend/gamepad";

async function prepare(hv: {}) {
}

async function install(hv: {}) {

}

async function startup(hv: {frontbus: any}, keys: Parameters<typeof gamepad_trigger>[1]) {
    if (typeof keys != 'object') {
        keys = `${keys}` in padmap? padmap[keys as string]: padmap['default']
    }
    hv.frontbus.on('pad', gamepad_trigger((key, value) => hv.frontbus.emit('keyboard', key, value), keys))
}

export default {
    prepare,
    install,
    startup
}
