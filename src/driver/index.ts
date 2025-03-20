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

export function get_driver(driver_name: string) {
    const driver = driver_map[driver_name] as libI | undefined

    if (driver) {
        return driver
    }

    return {
        prepare: async (_: {}) => {},
        install: async (_: {}) => {},
        startup: async (_: {}) => {}
    } as libI
}
