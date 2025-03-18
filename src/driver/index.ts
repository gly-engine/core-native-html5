import { libI } from "../type";
import wasmoon from "./wasmoon";
import runtime from "./runtime";
import keyboard from "./keyboard";

const driver_map = {
    wasmoon,
    runtime,
    keyboard
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
