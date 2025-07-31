import { renderI } from '../type'

function hexToColor(color: number) {
    const r = (color >>> 24) & 0xFF;
    const g = (color >>> 16) & 0xFF;
    const b = (color >>> 8) & 0xFF;
    const a = (color & 0xFF) / 255;
    return 'rgba(' + r + ',' + g + ',' + b + ',' + a.toFixed(3) + ')';
}

export function native_draw_start(render: renderI) {
    render.ctx.clearRect(0, 0, render.canvas.width, render.canvas.height)
}

export function native_draw_flush(render: renderI) {

}

export function native_draw_clear(render: renderI, color: number, x?: number, y?: number, w?: number, h?: number) {
    render.ctx.fillStyle = hexToColor(color)
    render.ctx.fillRect(x ?? 0, y ?? 0, w ?? render.canvas.width, h ?? render.canvas.height)
}

export function native_draw_color(render: renderI, color: number) {
    const fillstyle = hexToColor(color)
    render.ctx.strokeStyle = fillstyle
    render.ctx.fillStyle = fillstyle
}

export function native_draw_line(render: renderI, x1: number, y1: number, x2: number, y2: number) {
    render.ctx.beginPath()
    render.ctx.moveTo(x1, y1)
    render.ctx.lineTo(x2, y2)
    render.ctx.stroke()
}

export function native_draw_rect(render: renderI, mode: number, x: number, y: number, w: number, h: number) {
    if (mode == 1) {
        render.ctx.strokeRect(x, y, w, h)
    } else {
        render.ctx.fillRect(x, y, w, h)
    }
}

export function native_draw_poly2(render: renderI, mode: number, verts: Array<number>, x: number, y:number, scale:number, angle:number, ox:number, oy:number) {
   
    let index = 0
    render.ctx.beginPath()
    while (index < verts.length) {
        const px = verts[index];
        const py = verts[index + 1];
        const xx = x + ((ox - px) * -scale * Math.cos(angle)) - ((oy - py) * -scale * Math.sin(angle));
        const yy = y + ((oy - px) * -scale * Math.sin(angle)) + ((ox - py) * -scale * Math.cos(angle));
        if (index < 2) {
            render.ctx.moveTo(xx, yy)
        } else {
            render.ctx.lineTo(xx, yy)
        }
        index += 2;
    }
    ([
        () => render.ctx.fill(),
        () => {
            render.ctx.closePath()
            render.ctx.stroke()
        },
        () => render.ctx.stroke()
    ])[mode]()
}
