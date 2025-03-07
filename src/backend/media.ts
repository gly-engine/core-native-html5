import { mediaD } from "../types";

export function native_media_bootstrap(mixer: mediaD, mediaid: number, mediatype: string) {
    if (mediaid != 0 && mediatype == 'video') {
        throw new Error('video only can display in mediaid 0')
    }
    mixer[mediaid] = {}
    return 5;
}

export function native_media_load(mixer: mediaD, mediaid: number, channel:number, url: string) {
    if (!mixer[mediaid][channel]) {
        const el = document.createElement(mediaid? 'audio': 'video')
         // @ts-ignore
        document.querySelector('main').appendChild(el)
        mixer[mediaid][channel] = el
    }
    mixer[mediaid][channel].src = url
    mixer[mediaid][channel].load()
    if (!mediaid) {
        mixer[mediaid][channel].style.zIndex = `${-channel -1}`
    }
}

export function native_media_position(mixer: mediaD, mediaid: number, channel:number, x, y) {
    if (!mediaid)  {
        mixer[mediaid][channel].style.left = `${x}px`
        mixer[mediaid][channel].style.top = `${y}px`
    }   
}

export function native_media_resize(mixer: mediaD, mediaid: number, channel:number, width, height) {
    if (!mediaid)  {
        mixer[mediaid][channel].style.width = `${width}px`
        mixer[mediaid][channel].style.height = `${height}px`
    }
}
export function native_media_play(mixer: mediaD, mediaid: number, channel:number) {
    mixer[mediaid][channel].play()
}

export function native_media_pause(mixer: mediaD, mediaid: number, channel:number) {
    mixer[mediaid][channel].pause()
}

export function native_media_time(mixer: mediaD, mediaid: number, channel:number, time) {
    // @ts-ignore
    if (mixer[mediaid][channel].fastSeek) {
        mixer[mediaid][channel].fastSeek(time)
    } else {
        mixer[mediaid][channel].currentTime = time
    }
}
