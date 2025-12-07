import { renderI, imageD } from "../type";

function preload_image(src: string) {
    return document.querySelector(`img[src="${src}"]`) as HTMLImageElement | null
}

async function load_image(src: string) {
    return new Promise<HTMLImageElement | null>((resolve, reject) => {
        const el = document.createElement('img')
        el.src = src
        const failed = (ev: string | Event) => {
            resolve(null)
            console.error(`[core:html5] image src "${src}" ${typeof ev === 'string'? ev: ev.type}`)
        }
        el.onerror = failed
        el.onabort = failed
        el.onload = () => resolve(el)
    });
}

function get_image_from_id(cache: imageD, id: number | undefined) {
    if (id) {
        const el = cache.data[id]
        if (el === null) {
            return undefined
        }
        if (el === undefined) {
            throw new Error(`[core:html5] image id ${id} not exist!`)
        }
        return el
    }
    return undefined
}

export function native_image_load(render: renderI, cache: imageD, src: string, url?: string) {
    const id = cache.name[src]

    if (id) {
        return cache.data[id]? id: undefined
    }

    const el_preloaded = preload_image(src)

    if (el_preloaded) {
        const new_id = ++cache.count;
        cache.name[src] = new_id;
        cache.data[new_id] = el_preloaded;
        return new_id;
    }

    const new_id = ++cache.count
    cache.name[src] = new_id
    load_image(src).then((el) => cache.data[new_id] = el)

    return undefined
}

export function native_image_draw(render: renderI, cache: imageD, src: string | number, x: number, y: number) {
    const id = typeof src == 'string'? native_image_load(render, cache, src): src;
    const el = get_image_from_id(cache, id)
    
    if (el) {
        render.ctx.drawImage(el, x, y)
    }
}

export function native_image_mensure(render: renderI, cache: imageD, src: string | number) {
    const id = typeof src == 'string'? native_image_load(render, cache, src): src;
    const el = get_image_from_id(cache, id)
   
    if (el) {
        return [el.width, el.height]
    }

    return [0, 0]
}

export function native_image_unload(cache: imageD, src: string | number) {
    const clear_by_name = (src: string) => {
        do {
            const id = cache.name[src]
            if (!id) break;

            delete cache.name[src];

            if (!cache.data[id]) break;

            delete cache.data[id];
        }
        while(0);
    }


    if (typeof src == 'number') {
        const name = Object.entries(cache.name).find(([_, id]) => id == src)?.[0] ?? '';
        return clear_by_name(name)
    }

    return clear_by_name(src)
}

export function native_image_unload_all(cache: imageD) {
    cache.count = 0
    cache.data = []
    cache.name = {}
}
