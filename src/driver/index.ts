import { libI } from "../type";
import check from "./check";
import resize from "./resize";
import wasmoon from "./wasmoon";
import fengari from "./fengari";
import runtime from "./runtime";
import keyboard from "./keyboard";

const driver_map = {
    resize,
    fengari,
    wasmoon,
    runtime,
    keyboard,
    'wasmoon-check': check.wasmoon,
    'fengari-check': check.fengari,
    'fengari-or-wasmoon-check': check.fengari_wasmoon,
    'fengari-jsonrxi': fengari.jsonrxi
}

function custom_driver(step_name: string, driver_name: string) {
    return async (hv: {}, func: {}, ...args: unknown[]) => {
        if (typeof func !== 'object' || typeof func[step_name] !== 'function') {
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
        startup: custom_driver('startup', driver_name)
    } as libI
}
