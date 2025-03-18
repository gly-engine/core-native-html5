import { libI } from "../type";
import wasmoon from "./wasmoon";

const driver_map = {
    wasmoon, 
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
