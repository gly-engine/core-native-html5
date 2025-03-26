const is_video = <T extends (...args: any[]) => any>(type: string, func: T): T => 
    (type === 'video' ? func : (() => {}) as T);

function set_time(el: HTMLVideoElement | HTMLAudioElement) {
    return function(time: number) {
        if (el.fastSeek) {
            el.fastSeek(time)
        } else {
            el.currentTime = time
        }
    }
}

function can(type: string, url: string) {
    return ['video', 'audio'].includes(type)
}

function init(type: 'video' | 'audio', channel: number) {
    const el_media = document.createElement(type)
    const el_root = document.querySelector('main') as HTMLElement

    is_video(type, () => el_media.style.zIndex = `${-channel -1}`)()
    el_root.appendChild(el_media)

    return {
        can: can,
        set_time: set_time(el_media),
        source: (url: string) => {
            el_media.src = url
        },
        play: () => {
            set_time(el_media)(0)
            el_media.play()
        },
        pause: () => {
            el_media.pause()
        },
        resume: () => {
            el_media.play()
        },
        resize: is_video(type, (width, height) => {
            el_media.style.width = `${width}px`
            el_media.style.height = `${height}px`
        }),
        position: is_video(type, (x, y) => {
            el_media.style.left = `${x}px`
            el_media.style.top = `${y}px`
        }),        
        destroy: () => {
            el_root.removeChild(el_media)
        }
    }
}

async function startup (hv: {media_players: Array<{can: typeof can, init: typeof init}>}) {
    hv.media_players.push({init, can})
}

export default {
    prepare: async () => {},
    install: async () => {},
    startup
}
