import { mediaD } from "../type";

export function native_media_bootstrap(media: mediaD, _, mediatype: string) {
    media.devices.push(mediatype)
    media.mixer[media.devices.length - 1] = null
    return 1
}

//! @todo rename to native_media_source
//! @todo remove second paramter unusued
export function native_media_load(media: mediaD, _, channel:number, url: string) {
    const type = media.devices[channel]

    if(media.mixer[channel] && !media.mixer[channel].can(type, url)) {
        media.mixer[channel].destroy()
        media.mixer[channel] = null
    }

    if(!media.mixer[channel]) {
        const player = media.players.find(player => player.can(type, url))
        media.mixer[channel] = player && player.init(type, channel) || null
    }
    
    if (!media.mixer[channel]) {
        console.error(`unsupported media: channel ${channel} type ${type} url ${url}`)
        return false
    }

    media.mixer[channel].source(url)
    return true
}

export function native_media_position(media: mediaD, _, channel: number, x: number, y: number) {
    media.mixer[channel]?.position(x, y)
}

export function native_media_resize(media: mediaD, _, channel:number, width, height) {
    media.mixer[channel]?.resize(width, height)
}
export function native_media_play(media: mediaD, _, channel:number) {
    media.mixer[channel]?.play()
}

export function native_media_resume(media: mediaD, _, channel:number) {
    media.mixer[channel]?.resume()
}

export function native_media_pause(media: mediaD, _, channel:number) {
    media.mixer[channel]?.pause()
}

export function native_media_time(media: mediaD, _, channel:number, time: number) {
    media.mixer[channel]?.set_time(time)
}
