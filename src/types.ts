export type fontI = {
    name: string,
    size: number,
    old: {
        name: string,
        size: number
    }
}

export type imageD =  {[key: string]: HTMLImageElement}
export type mediaD = Array<{[key: number]: HTMLVideoElement | HTMLAudioElement }>

export type renderI = {
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D
}
