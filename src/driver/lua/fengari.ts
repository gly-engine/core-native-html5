import { create_code } from "../../frontend"

type HyperVisorFengari = {
    code: {
        engine: () => Promise<string>
    },
    backend: {},
    frontbus: {
        on: (key: string, func: unknown) => {}
    },
    vm: {
        lua: unknown,
        fengari: any
    }
}

async function prepare_jsonrxi(hv: HyperVisorFengari, json_lib_rxi: string) {
    if (!hv.vm.fengari) {
        return;
    }
    const pseudonym = 'jsonrxi.lua'
    const lua_lib = await create_code(pseudonym, json_lib_rxi)()
    const lua_code = lua_lib.replace('json.encode', 'native_json_encode').replace('json.decode', 'native_json_decode')
    const lua_buffer = hv.vm.fengari.to_luastring(lua_code)
    hv.vm.fengari.lauxlib.luaL_loadbuffer(hv.vm.lua, lua_buffer, lua_code.length, pseudonym);
    hv.vm.fengari.lua.lua_pcall(hv.vm.lua, 0, 0, 0);
}

async function prepare(hv: HyperVisorFengari, fengari: any) {
    if (!fengari || hv.vm.lua) {
        return;
    }

    hv.vm.fengari = fengari
    hv.vm.lua = fengari.lauxlib.luaL_newstate();
    fengari.lualib.luaL_openlibs(hv.vm.lua)
}

async function install(hv: HyperVisorFengari, fengari: any) {
    if (!hv.vm.fengari) {
        return;
    }

    const httplua = (reqid: number, key: string, data?: unknown) => {
        const params = data !== undefined? 3: 2
        fengari.lua.lua_getglobal(hv.vm.lua, fengari.to_luastring('native_callback_http'))
        fengari.lua.lua_pushinteger(hv.vm.lua, reqid);
        fengari.lua.lua_pushstring(hv.vm.lua, fengari.to_luastring(key));
        if (typeof data == 'string') {
            fengari.lua.lua_pushstring(hv.vm.lua, fengari.to_luastring(data));
        }
        if (typeof data == 'number') {
            fengari.lua.lua_pushnumber(hv.vm.lua, data);
        }
        if (typeof data == 'boolean') {
            fengari.lua.lua_pushboolean(hv.vm.lua, data);
        }
        if(fengari.lua.lua_pcall(hv.vm.lua, params, 1, 0) !== 0){
            const err =  fengari.to_jsstring(fengari.lua.lua_tostring(hv.vm.lua, -1));
            fengari.lua.lua_settop(hv.vm.lua, 0);
            throw err;
        }
        if (fengari.lua.lua_type(hv.vm.lua, -1) == fengari.lua.LUA_TSTRING) {
            const res = fengari.to_jsstring(fengari.lua.lua_tostring(hv.vm.lua, -1));
            fengari.lua.lua_settop(hv.vm.lua, 0);
            return res;
        }
        fengari.lua.lua_settop(hv.vm.lua, 0);
    }

    const define_lua_callback = (func_name, func_decorator?) => {
        hv.frontbus.on(func_name.replace(/^native_callback_/, ''), (a, b, c, d, e, f) => {
            fengari.lua.lua_getglobal(hv.vm.lua, fengari.to_luastring(func_name))
            const func = func_decorator ?? (() => 0)
            const res = func(a, b, c, d, e, f) ?? 0;
            if (fengari.lua.lua_pcall(hv.vm.lua, res, 0, 0) !== 0) {
                const error_message = fengari.lua.lua_tostring(hv.vm.lua, -1)
                throw error_message && fengari.to_jsstring(error_message) || func_name
            }
        })
    }

    const define_lua_func = (func_name, func_decorator) => {
        const func_native = hv.backend[func_name];
        fengari.lua.lua_pushcfunction(hv.vm.lua, () => {
            try {
                const res = func_decorator(func_native);
                return res ?? 0;
            } catch (e) {
                throw `${e} in ${func_name}`
            }
        });
        fengari.lua.lua_setglobal(hv.vm.lua, fengari.to_luastring(func_name));
    }
    
    define_lua_func('native_draw_start', (func) => {
        func();
    });

    define_lua_func('native_draw_flush', (func) => {
        func();
    });

    define_lua_func('native_draw_clear', (func) => {
        const color = fengari.lua.lua_tointeger(hv.vm.lua, 1) >>> 0;;
        const x = fengari.lua.lua_tonumber(hv.vm.lua, 2);
        const y = fengari.lua.lua_tonumber(hv.vm.lua, 3);
        const w = fengari.lua.lua_tonumber(hv.vm.lua, 4);
        const h = fengari.lua.lua_tonumber(hv.vm.lua, 5);
        fengari.lua.lua_settop(hv.vm.lua, 0);
        func(color, x, y, w, h);
    });

    define_lua_func('native_draw_color', (func) => {
        const color = fengari.lua.lua_tointeger(hv.vm.lua, 1) >>> 0;
        fengari.lua.lua_settop(hv.vm.lua, 0);
        func(color);
    });

    define_lua_func('native_draw_rect', (func) => {
        const mode = fengari.lua.lua_tointeger(hv.vm.lua, 1);
        const x = fengari.lua.lua_tonumber(hv.vm.lua, 2);
        const y = fengari.lua.lua_tonumber(hv.vm.lua, 3);
        const w = fengari.lua.lua_tonumber(hv.vm.lua, 4);
        const h = fengari.lua.lua_tonumber(hv.vm.lua, 5);
        fengari.lua.lua_settop(hv.vm.lua, 0);
        func(mode, x, y, w, h);
    });

    define_lua_func('native_draw_rect2', (func) => {
        const mode = fengari.lua.lua_tointeger(hv.vm.lua, 1);
        const x = fengari.lua.lua_tonumber(hv.vm.lua, 2);
        const y = fengari.lua.lua_tonumber(hv.vm.lua, 3);
        const w = fengari.lua.lua_tonumber(hv.vm.lua, 4);
        const h = fengari.lua.lua_tonumber(hv.vm.lua, 5);
        const r = fengari.lua.lua_tonumber(hv.vm.lua, 6);
        fengari.lua.lua_settop(hv.vm.lua, 0);
        func(mode, x, y, w, h, r);
    });

    define_lua_func('native_draw_line', (func) => {
        const x1 = fengari.lua.lua_tonumber(hv.vm.lua, 1);
        const y1 = fengari.lua.lua_tonumber(hv.vm.lua, 2);
        const x2 = fengari.lua.lua_tonumber(hv.vm.lua, 3);
        const y2 = fengari.lua.lua_tonumber(hv.vm.lua, 4);
        fengari.lua.lua_settop(hv.vm.lua, 0);
        func(x1, y1, x2, y2);
    });

    define_lua_func('native_draw_poly2', (func) => {
        let i = 1;
        const mode = fengari.lua.lua_tointeger(hv.vm.lua, 1);
        const verts: Array<number> = [];
        const x = fengari.lua.lua_tonumber(hv.vm.lua, 3);
        const y = fengari.lua.lua_tonumber(hv.vm.lua, 4);
        const scale = fengari.lua.lua_tonumber(hv.vm.lua, 5);
        const angle = fengari.lua.lua_tonumber(hv.vm.lua, 6);
        const ox = fengari.lua.lua_tonumber(hv.vm.lua, 7);
        const oy = fengari.lua.lua_tonumber(hv.vm.lua, 8);
        while (fengari.lua.lua_rawgeti(hv.vm.lua, 2, i) !== fengari.lua.LUA_TNIL) {
            verts.push(fengari.lua.lua_tonumber(hv.vm.lua, -1));
            fengari.lua.lua_pop(hv.vm.lua, 1);
            i++;
        }
        fengari.lua.lua_settop(hv.vm.lua, 0);
        func(mode, verts, x, y, scale, angle, ox, oy)
    });

    define_lua_func('native_text_print', (func) => {
        const x = fengari.lua.lua_tonumber(hv.vm.lua, 1);
        const y = fengari.lua.lua_tonumber(hv.vm.lua, 2);
        const text = fengari.to_jsstring(fengari.lua.lua_tostring(hv.vm.lua, 3));
        fengari.lua.lua_settop(hv.vm.lua, 0);
        func(x, y, text);
    });

    define_lua_func('native_text_font_size', (func) => {
        const size = fengari.lua.lua_tonumber(hv.vm.lua, 1);
        fengari.lua.lua_settop(hv.vm.lua, 0);
        func(size);
    });

    define_lua_func('native_text_font_name', (func) => {
        const name = fengari.to_jsstring(fengari.lua.lua_tostring(hv.vm.lua, 1));
        fengari.lua.lua_settop(hv.vm.lua, 0);
        func(name);
    });

    define_lua_func('native_text_font_default', (func) => {
        func();
    });

    define_lua_func('native_text_font_previous', (func) => {
        func();
    });

    define_lua_func('native_text_mensure', (func) => {
        const text = fengari.to_jsstring(fengari.lua.lua_tostring(hv.vm.lua, 1));
        fengari.lua.lua_settop(hv.vm.lua, 0);
        const [width, height] = func(text);
        fengari.lua.lua_pushnumber(hv.vm.lua, width);
        fengari.lua.lua_pushnumber(hv.vm.lua, height);
        return 2;
    });

    define_lua_func('native_system_get_language', (func) => {
        fengari.lua.lua_pushstring(hv.vm.lua, func());
        return 1;
    });

    define_lua_func('native_system_get_env', (func) => {
        const var_name = fengari.to_jsstring(fengari.lua.lua_tostring(hv.vm.lua, 1));
        fengari.lua.lua_settop(hv.vm.lua, 0);
        const var_value = func(var_name);
        if (var_value) {
            fengari.lua.lua_pushstring(hv.vm.lua, var_value);
            return 1;
        }
    });

    define_lua_func('native_image_load', (func) => {
        const src = fengari.to_jsstring(fengari.lua.lua_tostring(hv.vm.lua, 1));
        const url = fengari.lua.lua_type(hv.vm.lua, 2) === fengari.lua.LUA_TSTRING
            ? fengari.to_jsstring(fengari.lua.lua_tostring(hv.vm.lua, 2))
            : null;
        fengari.lua.lua_settop(hv.vm.lua, 0);
        func(src, url)
    });

    define_lua_func('native_image_draw', (func) => {
        const src = fengari.to_jsstring(fengari.lua.lua_tostring(hv.vm.lua, 1));
        const x = fengari.lua.lua_tonumber(hv.vm.lua, 2);
        const y = fengari.lua.lua_tonumber(hv.vm.lua, 3);
        fengari.lua.lua_settop(hv.vm.lua, 0);
        func(src, x, y)
    });

    define_lua_func('native_image_mensure', (func) => {
        const src = fengari.to_jsstring(fengari.lua.lua_tostring(hv.vm.lua, 1));
        fengari.lua.lua_settop(hv.vm.lua, 0);
        const [width, height] = func(src);
        if (width && height) {
            fengari.lua.lua_pushnumber(hv.vm.lua, width);
            fengari.lua.lua_pushnumber(hv.vm.lua, height);
            return 2;
        }
    });

    define_lua_func('native_media_bootstrap', (func) => {
        const mediatype = fengari.to_jsstring(fengari.lua.lua_tostring(hv.vm.lua, 1))
        const channels = func(mediatype)
        fengari.lua.lua_settop(hv.vm.lua, 0);
        fengari.lua.lua_pushnumber(hv.vm.lua, channels)
        return 1
    });

    define_lua_func('native_media_source', (func) => {
        const channel = fengari.lua.lua_tonumber(hv.vm.lua, 1);
        const src = fengari.to_jsstring(fengari.lua.lua_tostring(hv.vm.lua, 2));
        fengari.lua.lua_settop(hv.vm.lua, 0);
        func(channel, src)
    });

    define_lua_func('native_media_position', (func) => {
        const channel = fengari.lua.lua_tonumber(hv.vm.lua, 1);
        const x = fengari.lua.lua_tonumber(hv.vm.lua, 2);
        const y = fengari.lua.lua_tonumber(hv.vm.lua, 3);
        const w = fengari.lua.lua_tonumber(hv.vm.lua, 4);
        const h = fengari.lua.lua_tonumber(hv.vm.lua, 5);
        fengari.lua.lua_settop(hv.vm.lua, 0);
        func(channel, x, y, w, h)
    });

    define_lua_func('native_media_time', (func) => {
        const channel = fengari.lua.lua_tonumber(hv.vm.lua, 1);
        const time = fengari.lua.lua_tonumber(hv.vm.lua, 2);
        fengari.lua.lua_settop(hv.vm.lua, 0);
        func(channel, Math.floor(time));
    });

    define_lua_func('native_media_resume', (func) => {
        const channel = fengari.lua.lua_tonumber(hv.vm.lua, 1);
        fengari.lua.lua_settop(hv.vm.lua, 0);
        func(channel);
    });

    define_lua_func('native_media_play', (func) => {
        const channel = fengari.lua.lua_tonumber(hv.vm.lua, 1);
        fengari.lua.lua_settop(hv.vm.lua, 0);
        func(channel);
    });

    define_lua_func('native_media_pause', (func) => {
        const channel = fengari.lua.lua_tonumber(hv.vm.lua, 1);
        fengari.lua.lua_settop(hv.vm.lua, 0);
        func(channel);
    });

    define_lua_func('native_media_stop', (func) => {
        const channel = fengari.lua.lua_tonumber(hv.vm.lua, 1);
        fengari.lua.lua_settop(hv.vm.lua, 0);
        func(channel);
    });

    define_lua_func('native_http_handler', (func) => {
        const request_id = fengari.lua.lua_tonumber(hv.vm.lua, 2);
        fengari.lua.lua_settop(hv.vm.lua, 0);
        func({
            param_dict: {},
            header_dict: {},
            set: (key, value) => httplua(request_id, `set-${key}`, value),
            promise: () => httplua(request_id, 'async-promise'),
            resolve: () => httplua(request_id, 'async-resolve'),
            method: httplua(request_id, 'get-method'),
            body: httplua(request_id, 'get-body'),
            url: httplua(request_id, 'get-fullurl')
        })
    });

    define_lua_func('native_log_debug', (func) => {
        func(fengari.to_jsstring(fengari.lua.lua_tostring(hv.vm.lua, 1)));
    })

    define_lua_func('native_log_info', (func) => {
        func(fengari.to_jsstring(fengari.lua.lua_tostring(hv.vm.lua, 1)));
    })

    define_lua_func('native_log_warn', (func) => {
        func(fengari.to_jsstring(fengari.lua.lua_tostring(hv.vm.lua, 1)));
    })

    define_lua_func('native_log_error', (func) => {
        func(fengari.to_jsstring(fengari.lua.lua_tostring(hv.vm.lua, 1)));
    })

    define_lua_func('native_log_fatal', (func) => {
        func(fengari.to_jsstring(fengari.lua.lua_tostring(hv.vm.lua, 1)));
    })

    if (window.location.protocol == 'https:') {
        fengari.lua.lua_pushstring(hv.vm.lua, fengari.to_luastring('https'))
        fengari.lua.lua_setglobal(hv.vm.lua, fengari.to_luastring('native_http_force_protocol'))
    }

    fengari.lua.lua_pushboolean(hv.vm.lua, true)
    fengari.lua.lua_setglobal(hv.vm.lua, fengari.to_luastring('native_http_has_ssl'))

    const lua_engine = await hv.code.engine()
    fengari.lauxlib.luaL_loadbuffer(hv.vm.lua, fengari.to_luastring(lua_engine), lua_engine.length, 'engine');
    fengari.lua.lua_pcall(hv.vm.lua, 0, 0, 0);

    define_lua_callback('native_callback_init', (width, height, game) => {
        fengari.lua.lua_pushnumber(hv.vm.lua, width);
        fengari.lua.lua_pushnumber(hv.vm.lua, height);
        fengari.lauxlib.luaL_loadbuffer(hv.vm.lua, fengari.to_luastring(game), game.lenght, 'game');
        return 3;
    })

    define_lua_callback('native_callback_draw')
    define_lua_callback('native_callback_loop', (dt) => {
        fengari.lua.lua_pushnumber(hv.vm.lua, dt);
        return 1;
    })

    define_lua_callback('native_callback_resize', (width, height) => {
        fengari.lua.lua_pushnumber(hv.vm.lua, width);
        fengari.lua.lua_pushnumber(hv.vm.lua, height);
        return 2;
    })

    define_lua_callback('native_callback_keyboard', (key, value) => {
        fengari.lua.lua_pushstring(hv.vm.lua, fengari.to_luastring(key));
        fengari.lua.lua_pushboolean(hv.vm.lua, value);
        return 2;
    })
}

async function startup(hv: HyperVisorFengari, fengari: any) {

}

async function destroy(hv: HyperVisorFengari) {
    if (hv.vm.fengari) {
        hv.vm.fengari.lua.lua_close(hv.vm.lua)
    }
}

export default {
    jsonrxi: {
        prepare: prepare_jsonrxi,
        install: async (hv: {})=>{},
        startup: async (hv: {})=>{}
    },
    prepare,
    install,
    startup,
    destroy
}
