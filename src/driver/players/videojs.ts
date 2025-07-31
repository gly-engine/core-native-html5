function can(type: string, url: string, score: number) {
    if (!['video', 'stream'].includes(type)) {
        return 0;
    }

    if (/\.(m3u8|mpd)$/i.test(url)) {
        return score + 40
    }

    return score + 20
}

function init(videojslib: any, type: string, channel: number) {
    const el_root = document.querySelector('main') as HTMLElement
    const el_media = document.createElement('video')

    el_media.className = 'video-js'
    el_root.appendChild(el_media)

    if (!document.querySelector('#vsj-hidden')) {
        const style = document.createElement('style')
        style.innerHTML = '.vsj-hidden, .video-js div, .video-js button { display: none }'
        style.id = 'vsj-hidden'
        document.head.appendChild(style)
    }
    
    el_media.style.zIndex = `${-channel - 1}`
    const player = videojslib(el_media, {
        controls: false,
    })
    
    return {
        can: can,
        set_time: (time: number) => {
            player.currentTime(time)
        },
        source: (url: string) => {
            player.src({ src: url })
        },
        play: () => {
            player.currentTime(0)
            player.play()
        },
        pause: () => {
            player.pause()
        },
        resume: () => {
            player.play()
        },
        position: (x, y, width, height) => {
            player.width(width)
            player.height(height)
            el_media.style.left = `${x}px`
            el_media.style.top = `${y}px`
            el_media.style.width = `${width}px`
            el_media.style.height = `${height}px`
        },
        destroy: () => {
            player.dispose()
            const drop = () => el_media.remove()
            el_media.onabort = drop
            el_media.onerror = drop
            el_media.onload = drop
            el_media.src = ""
            el_media.load()
            el_media.remove()
        }
    }
}

async function create_player(hv: { media_players: Array<{ can: typeof can, init: (a: string, b: number) => void }> }, videojslib: any) {
    if (videojslib) {
        hv.media_players.push({can, init: (a: string, b: number) => init(videojslib, a, b)})
    }
}

export default {
    prepare: create_player,
    install: async () => {},
    startup: async () => {}
}
