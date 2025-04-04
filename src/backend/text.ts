import { renderI, fontI } from "../type";

function font_apply_if_changes(render: renderI, font: fontI){
    if (font.name != font.old.name || font.size != font.old.size) {
        render.ctx.font = `${font.size}px ${font.name}`
        render.ctx.textBaseline = 'top'
        render.ctx.textAlign = 'left'
    }
}

export function native_text_font_name(render: renderI, font: fontI, name: string) {
    font.name = name
}

export function native_text_font_size(render: renderI, font: fontI, size: number) {
    font.size = Math.floor(size)
}

export function native_text_font_default(render: renderI, font: fontI, id: number) {
    font.name = 'sans'
}

export function native_text_font_previous(render: renderI, font: fontI) {
    const [name, size] = [font.name, font.size]
    font.name = font.old.name
    font.size = font.old.size
    font.old.name = name
    font.old.size = size
}

export function native_text_print(render: renderI, font: fontI, x: number, y: number, text: string) {
    font_apply_if_changes(render, font)
    render.ctx.fillText(text, x, y)
}

export function native_text_mensure(render: renderI, font: fontI, text: string) {
    font_apply_if_changes(render, font)
    const { width, actualBoundingBoxAscent, actualBoundingBoxDescent } = render.ctx.measureText(text)
    return [width, actualBoundingBoxAscent + actualBoundingBoxDescent]
}
