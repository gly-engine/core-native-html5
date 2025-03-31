function youtubeId(url: string): string | null {
    const regex = /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|v\/))([^?&"'>]+)/
    const match = url.match(regex)
    return match ? match[1] : null
}

function can(type: string, url: string, score: number) {
    if (!['video', 'youtube'].includes(type)) {
        return 0
    }

    if (url.length === 0) {
        return 1
    }
    
    if (youtubeId(url)) {
        return 100
    }
    
    return 0
}

function init(type: string, channel: number) {
    const el_root = document.querySelector('main') as HTMLElement
    const iframe = document.createElement('iframe')
    iframe.className = 'youtube-player'
    iframe.frameBorder = '0'
    iframe.allow = 'autoplay encrypted-media'
    iframe.allowFullscreen = true
    el_root.appendChild(iframe)

    let isPlayerReady = false
    iframe.style.zIndex = `${-channel - 1}`
    iframe.addEventListener('load', () => {
        isPlayerReady = true
    })

    function sendCommandWhenReady(func: string, args: any[] = []) {
        if (isPlayerReady) {
            iframe.contentWindow?.postMessage(
                JSON.stringify({ event: 'command', func, args }),
                '*'
            )
        } else {
            setTimeout(() => sendCommandWhenReady(func, args), 100)
        }
    }

    return {
        can: can,
        set_time: (time: number) => {
            sendCommandWhenReady('seekTo', [time, true])
        },
        source: (url: string) => {
            iframe.src = `https://www.youtube.com/embed/${youtubeId(url)}?enablejsapi=1&autoplay=0&modestbranding=1&controls=0`
        },
        play: () => {
            sendCommandWhenReady('playVideo')
        },
        pause: () => {
            sendCommandWhenReady('pauseVideo')
        },
        resume: () => {
            sendCommandWhenReady('playVideo')
        },
        resize: (width: number, height: number) => {
            iframe.style.width = `${width}px`
            iframe.style.height = `${height}px`
        },
        position: (x: number, y: number) => {
            iframe.style.left = `${x}px`
            iframe.style.top = `${y}px`
        },
        destroy: () => {
            el_root.removeChild(iframe)
        }
    }
}

async function create_player(hv: { media_players: Array<{ can: typeof can, init: typeof init }> }) {
    hv.media_players.push({ init, can })
}

export default {
    prepare: create_player,
    install: async () => {},
    startup: async () => {}
}
