import core_native_html5 from '../src/index.ts'
import { LuaFactory, LuaMultiReturn } from 'wasmoon'

document.addEventListener('DOMContentLoaded', async () => {
    window.gly = await core_native_html5()
        .set_library('wasmoon', LuaFactory, LuaMultiReturn)
        .set_engine('https://cdn.jsdelivr.net/npm/@gamely/gly-engine-lite')
        .build()
})
