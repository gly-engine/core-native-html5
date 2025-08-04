import { mediaD } from "../type";

export function native_media_bootstrap(media: mediaD, mediatype: string) {
    const has_support = media.players.map((player => player.can(mediatype, '', 1))).some(score => score !== 0)
    media.devices.push(mediatype)
    media.mixer[media.devices.length - 1] = null
    return has_support? 1: 0
}

export function native_media_source(media: mediaD, channel:number, url: string) {
    const type = media.devices[channel]
    const players = media.players.length

    const best = media.players.map((player, index) => {
        const is_current = player == media.current[channel]
        const score = player.can(type, url, is_current? 20: players - index)
        return {player, score}
    }).reduce((max, current) => {
        return current.score > max.score ? current : max;
    })

    if (media.mixer[channel] && (best.score <= 10 || best.player !== media.current[channel])) {
        media.mixer[channel].destroy()
        media.mixer[channel] = null
    }

    if(!media.mixer[channel] && best.score > 10) {
        media.mixer[channel] = best.player.init(type, channel)
        media.current[channel] = best.player
    }

    if (!media.mixer[channel]) {
        console.error(`unsupported media: channel ${channel} type ${type}\n${url}`)
    }

    media.mixer[channel]?.source(url)
}

export function native_media_position(media: mediaD, channel: number, x: number, y: number, w: number, h: number) {
    media.mixer[channel]?.position(x, y, w, h)
}

export function native_media_play(media: mediaD, channel:number) {
    media.mixer[channel]?.play()
}

export function native_media_resume(media: mediaD, channel:number) {
    media.mixer[channel]?.resume()
}

export function native_media_pause(media: mediaD, channel:number) {
    media.mixer[channel]?.pause()
}

export function native_media_stop(media: mediaD, channel:number) {
    media.mixer[channel]?.destroy()
    media.mixer[channel] = null
}

export function native_media_time(media: mediaD, channel:number, time: number) {
    media.mixer[channel]?.set_time(time)
}
