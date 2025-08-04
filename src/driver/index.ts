import { libI } from "../type";
import resize from "./resize";
import runtime from "./runtime";
import gamepad from "./gamepad";
import keyboard from "./keyboard";
import check from "./lua/check";
import wasmoon from "./lua/wasmoon";
import fengari from "./lua/fengari";
import player_fake from './players/fake'
import player_html5 from './players/html5'
import player_videojs from './players/videojs'
import player_youtube from './players/youtube'

const none = {
    prepare: async(hv: {}) => {},
    install: async(hv: {}) => {},
    startup: async(hv: {}) => {}
}

const driver_map = {
    none,
    resize,
    fengari,
    wasmoon,
    runtime,
    gamepad,
    keyboard,
    'player-fake': player_fake,
    'player-html5': player_html5,
    'player-videojs': player_videojs,
    'player-youtube': player_youtube,
    'wasmoon-check': check.wasmoon,
    'fengari-check': check.fengari,
    'fengari-or-wasmoon-check': check.fengari_wasmoon,
    'fengari-jsonrxi': fengari.jsonrxi
}

function custom_driver(step_name: string, driver_name: string) {
    return async (hv: {}, func: {}, ...args: unknown[]) => {
        if (typeof func !== 'object' || typeof func[step_name] !== 'function') {
            if (step_name == 'destroy') return;
            throw new Error(`driver not found: ${driver_name} (${step_name})`)
        }
        await func[step_name](hv, ...args);
    }
}

export function get_driver(driver_name: string) {
    const driver = driver_map[driver_name] as libI | undefined

    if (driver) {
        return driver
    }

    return {
        prepare: custom_driver('prepare', driver_name),
        install: custom_driver('install', driver_name),
        startup: custom_driver('startup', driver_name),
        destroy: custom_driver('destroy', driver_name)
    } as libI
}
