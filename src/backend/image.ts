import { renderI, imageD } from "../type";
import { blockFunc } from "../util";

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

export function native_image_draw(render: renderI, cache: imageD, src: string, x: number, y: number) {
    blockFunc(async() => {
        if (!(src in cache)) {
            cache[src] = await load_image(src)
        }
        render.ctx.drawImage(cache[src], x, y)
    })
}
