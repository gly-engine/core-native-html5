import * as backend_canvas from './canvas.ts'
import * as backend_http from './http.ts'
import * as backend_image from './image.ts'
import * as backend_media from './media.ts'
import * as backend_text from './text.ts'
import * as backend_system from './system.ts'

export function create_canvas(canvas: HTMLCanvasElement | string | undefined) {
    if (typeof canvas == 'object') {
        return canvas
    }
    if (typeof canvas == 'string') {
        const el = document.querySelector(canvas)
        if (!el) {
            throw new Error(`element dont exist: ${canvas}`)
        }
        return el as HTMLCanvasElement
    }
    return document.createElement('canvas')
}

export function create_backend(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, players: Array<never>) {
    const render = {canvas, ctx}
    const text_cache = {name: 'sans', size: 5, old: {name: 'sans', size: 8}}
    const image_cache = {}
    const media_cache = {devices: [], current: [], mixer: {}, players}
    media_cache.players.push({can: () => 0} as never)

    return {
        native_http_handler: (self) =>backend_http.native_http_handler(self),
        native_draw_start: () => backend_canvas.native_draw_start(render),
        native_draw_flush: () => backend_canvas.native_draw_flush(render),
        native_draw_color: (color: number) => backend_canvas.native_draw_color(render, color),
        native_draw_clear: (color: number, x:number, y: number, w: number, h: number) => backend_canvas.native_draw_clear(render, color, x, y, w, h),
        native_draw_rect: (mode: number, x:number, y: number, w: number, h: number) => backend_canvas.native_draw_rect(render, mode, x, y, w, h),
        native_draw_line: (x1: number, y1: number, x2: number, y2: number) => backend_canvas.native_draw_line(render, x1, y1, x2, y2),
        native_draw_poly2: (mode: number, verts: Array<number>, x: number, y:number, scale:number, angle:number, ox:number, oy:number) => backend_canvas.native_draw_poly2(render, mode, verts, x, y, scale, angle, ox, oy),
        native_text_font_name: (name: string) => backend_text.native_text_font_name(render, text_cache, name),
        native_text_font_default: (id: number) => backend_text.native_text_font_default(render, text_cache, id),
        native_text_font_size: (size: number) => backend_text.native_text_font_size(render, text_cache, size),
        native_text_font_previous: (size: number) => backend_text.native_text_font_previous(render, text_cache),
        native_text_print: (x: number, y: number, text: string) => backend_text.native_text_print(render, text_cache, x, y, text),
        native_text_mensure: (text: string) => backend_text.native_text_mensure(render, text_cache, text),
        native_image_load: (src: string) => backend_image.native_image_load(render, image_cache, src),
        native_image_draw: (src: string, x: number, y: number) => backend_image.native_image_draw(render, image_cache, src, x, y),
        native_system_get_language: () => backend_system.native_system_get_language(),
        native_media_bootstrap: (mediatype: string) => backend_media.native_media_bootstrap(media_cache, mediatype),
        native_media_source: (channel: number, url: string) => backend_media.native_media_source(media_cache, channel, url),
        native_media_position: (channel: number, x: number, y: number) => backend_media.native_media_position(media_cache, channel, x, y),
        native_media_resize: (channel: number, width: number, height: number) => backend_media.native_media_resize(media_cache, channel, width, height),
        native_media_play: (channel: number) => backend_media.native_media_play(media_cache, channel),
        native_media_stop: (channel: number) => backend_media.native_media_stop(media_cache, channel),
        native_media_pause: (channel: number) => backend_media.native_media_pause(media_cache, channel),
        native_media_time: (channel: number, time: number) => backend_media.native_media_time(media_cache, channel, time),
        // for legacy compatibility:
        native_draw_poly: (mode: number, verts: Array<number>, x = 0, y = 0, scale = 1, angle = 0, ox = 0, oy = 0) =>  backend_canvas.native_draw_poly2(render, mode, verts, x, y, scale, angle, ox, oy),
        native_draw_image: (src: string, x: number, y: number) => backend_image.native_image_draw(render, image_cache, src, x, y),
        native_draw_text: (x: number | string, y: number, text: string | number) => {
            typeof x == 'number' && (text || text == 0) && backend_text.native_text_print(render, text_cache, x, y, `${text}`)        
            return backend_text.native_text_mensure(render, text_cache, `${text ?? x}`)
        },
        native_draw_font: (name: string, size: number) => {
            backend_text.native_text_font_name(render, text_cache, name)
            backend_text.native_text_font_size(render, text_cache, size)
        },
    };
}
