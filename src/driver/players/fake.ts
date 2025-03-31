import * as backend from '../../backend/canvas'

function set_time(time: number) {
    return Math.max(0, performance.now() - time)
}

function genVerts(ms: number, width: number, height: number): number[] {
    const pts: number[] = []
    const duration = 1000
    const points = [
        [width / 2, 0], [width, 0], [width, height],
        [0, height], [0, 0], [width / 2, 0]
    ];
    const segmentTime = duration / (points.length - 1);
    const step =  Math.min(Math.floor(ms / segmentTime), points.length - 2);
    const t = (ms % segmentTime) / segmentTime;

    function getLastPoint(): [number, number] {    
        const [x1, y1] = points[step];
        const [x2, y2] = points[step + 1];
        return [x1 + (x2 - x1) * t, y1 + (y2 - y1) * t];
    }
    pts.push(width / 2, height / 2)
    points.filter((_, index) => index < step + 1).forEach(points => pts.push(points[0], points[1]))    
    const [x, y] = getLastPoint()
    pts.push(x, y)
    return pts
}

function cronomether(ms) {
    let date = new Date(ms);
    let formattedTime = date.toISOString().substr(11, 8);
    let milliseconds = (ms % 1000).toFixed(0).padStart(3, '0');
    return `${formattedTime}:${milliseconds}`;
}

function can(type: string, url: string, score: number, default_score: number | undefined) {
    if (typeof default_score !== 'number') {
        default_score = 11
    }

    if (!['video', 'tv', 'youtube', 'stream'].includes(type)) {
        return 0;
    }

    return score + default_score;
}

function init(type: string, channel: number) {
    const el_root = document.querySelector('main') as HTMLElement
    const el_media = document.createElement('canvas')
    const ctx = el_media.getContext('2d') as CanvasRenderingContext2D
    const render = {canvas: el_media, ctx}
    

    let src = ''
    let cmd = 'init'
    let paused = true
    let started = performance.now()

    el_media.width = el_root.clientWidth
    el_media.height = el_root.clientHeight
    el_media.style.zIndex = `${-channel -1}`
    el_root.appendChild(el_media)

    function tick() {
        if (!el_media.parentElement) {
            return
        }
        const uptime = performance.now() - started
        const crono = cronomether(uptime)
        const [cor1, cor2] = [0x000000FF, 0x222222FF]
        const font1 = (el_media.width/80).toFixed(0)
        const font2 = (el_media.width/16).toFixed(0)
        const secs = Math.ceil(uptime/1000)

        backend.native_draw_clear(render, secs & 1? cor1: cor2)
        backend.native_draw_color(render, secs & 1? cor2: cor1)
        backend.native_draw_poly2(render, 0, genVerts(uptime % 1000, el_media.width, el_media.height), 0, 0, 1, 0, 0, 0)
        backend.native_draw_color(render, 0x333333FF)
        backend.native_draw_line(render, 0, el_media.height/2, el_media.width, el_media.height/2)
        backend.native_draw_line(render, el_media.width/2, 0, el_media.width/2, el_media.height)
        backend.native_draw_color(render, 0xFFFFFFFF)
        ctx.font = `${font1}px sans`
        ctx.textBaseline = 'top'
        ctx.textAlign = 'left'
        ctx.fillText(type, 0, 0)
        ctx.textBaseline = 'bottom'
        ctx.fillText(cmd, 0, el_media.height)
        ctx.textAlign = 'right'
        ctx.fillText(src, el_media.width, el_media.height)
        ctx.textBaseline = 'top'
        ctx.fillText(crono, el_media.width, 0)
        ctx.font = `${font2}px sans`
        ctx.textBaseline = 'middle'
        ctx.textAlign = 'center'
        ctx.fillText(`${secs}`, el_media.width/2, el_media.height/2)
        
        if (!paused) {
            window.requestAnimationFrame(tick)
        }
    }

    return {
        can: can,
        set_time: (time: number) => {
            started = set_time(time)
        },
        source: (url: string) => {
            cmd = 'source'
            src = url
        },
        play: () => {
            cmd = 'play'
            started = set_time(0)
            if (paused) {
                paused = false
                tick()
            }
        },
        pause: () => {
            cmd = 'pause'
            paused = true
        },
        resume: () => {
            cmd = 'resume'
            if (paused) {
                paused = false
                tick()
            }
        },
        resize: (width, height) => {
            cmd = 'resize'
            el_media.width = width
            el_media.height = height
        },
        position: (x, y) => {
            cmd = 'position'
            el_media.style.left = `${x}px`
            el_media.style.top = `${y}px`
        },        
        destroy: () => {
            el_media.remove()
        }
    }
}

async function create_player(hv: {media_players: Array<{can: typeof can, init: typeof init}>}, default_score: number | undefined) {
    hv.media_players.push({init, can: (a: string, b:string, c:number) => can(a, b, c, default_score)})
}

export default {
    prepare: create_player,
    install: async () => {},
    startup: async () => {}
}
