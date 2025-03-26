export type fontI = {
    name: string,
    size: number,
    old: {
        name: string,
        size: number
    }
}

export type imageD =  {[key: string]: HTMLImageElement | null}
export type mediaD = Array<{[key: number]: HTMLVideoElement | HTMLAudioElement }>

export type renderI = {
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D
}

export type libI = {
    prepare: (engine: {}, ...args: Array<unknown>) => Promise<void>,
    install: (engine: {}, ...args: Array<unknown>) => Promise<void>,
    startup: (engine: {}, ...args: Array<unknown>) => Promise<void>
}