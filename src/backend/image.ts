import { renderI, imageD } from "../type";

function preload_image(src) {
    return document.querySelector(`img[src="${src}"]`) as HTMLImageElement | null
}

async function load_image(src: string) {
    return new Promise<HTMLImageElement>((resolve, reject) => {
        const error = new Error(`img ${src} error!`)
        const el = document.createElement('img')
        el.src = src
        el.onload = () => resolve(el), 
        el.onerror = () => reject(error)
        el.onabort = () => reject(error)
    });
}

export function native_image_load(render: renderI, cache: imageD, src: string) {
    if (!(src in cache)) {
        cache[src] = preload_image(src)
        if (!cache[src]) {
            load_image(src).then((el) => cache[src] = el)
        }
    }
}

export function native_image_draw(render: renderI, cache: imageD, src: string, x: number, y: number) {
    native_image_load(render, cache, src)
    if (cache[src]) {
        render.ctx.drawImage(cache[src], x, y)
    }
}
