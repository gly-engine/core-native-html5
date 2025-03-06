export interface fontI {
    name: string,
    size: number,
    old: {
        name: string,
        size: number
    }
}

export interface renderI {
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D
}

export interface imageD {
    [key: string]: HTMLImageElement
}
