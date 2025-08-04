
import { create_backend } from "../backend";
import { is_paused, pause, resume } from "./pause";
import { create_code, create_emiter, create_frontend } from "../frontend";

type HyperVisorEngine = {
    code: {
        game: string | object
    },
    destroyed: boolean,
    frontbus: ReturnType<typeof create_emiter>,
    frontend: Awaited<ReturnType<typeof create_frontend>>,
    backend: Awaited<ReturnType<typeof create_backend>>,
    pause_reasons: Record<string, boolean>
}

export async function create_engine(hv: HyperVisorEngine, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, shutdown: () => Promise<void>) {
    const methods = () => ({
        frontend: hv.frontend,
        backend: hv.backend,
        pause: (motive: string) => {
            pause(hv.pause_reasons, motive)
            return methods()
        },
        resume: (motive: string) => {
            resume(hv.pause_reasons, motive)
            return methods()
        },
        paused: () => {
            return is_paused(hv.pause_reasons)
        },
        getImageData: () => {
            return ctx.getImageData(0, 0, canvas.width, canvas.height)
        },
        stroke: (size: number) => {
            ctx.lineWidth = size
            return methods()
        },
        on: (key: string, func: Function) => {
            hv.frontbus.on(key, func)
            return methods()
        },
        destroy: async () => {
            hv.backend.native_image_clear_all()
            hv.frontbus.shutdown()
            await shutdown();
        }
    })

    return methods()
}
