export type fontI = {
    name: string,
    size: number,
    old: {
        name: string,
        size: number
    }
}

export type imageD =  {[key: string]: HTMLImageElement | null}

export type mediaPlayerD = {
    play: () => void,
    pause: () => void,
    resume: () => void,
    destroy: () => void,
    source: (url: string) => void,
    resize: (x: number, y: number) => void,
    position: (x: number, y: number) => void,
    set_time: (miliseconds: number) => void,
    can: (type: string, url: string) => boolean,
}

export type mediaD = {
    devices: Array<string>,
    players: Array<{
        can: mediaPlayerD["can"]
        init: (type: string, channel: number) => mediaPlayerD
    }>
    mixer: Record<number, mediaPlayerD | null>
}

export type renderI = {
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D
}

export type libI = {
    prepare: (engine: {}, ...args: Array<unknown>) => Promise<void>,
    install: (engine: {}, ...args: Array<unknown>) => Promise<void>,
    startup: (engine: {}, ...args: Array<unknown>) => Promise<void>
}