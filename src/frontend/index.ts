import { is_paused, unpaused_call } from "./pause";

class EventEmitter {
    private events: { [key: string]: Function[] } = {};
  
    on(event: string, listener: Function): void {
      if (!this.events[event]) {
        this.events[event] = [];
      }
      this.events[event].push(listener);
    }
  
    off(event: string, listener: Function): void {
      if (!this.events[event]) return;
  
      const index = this.events[event].indexOf(listener);
      if (index !== -1) {
        this.events[event].splice(index, 1);
      }
    }

    emit(event: string, ...args: any[]): void {
      if (!this.events[event]) return;
  
      this.events[event].forEach(listener => listener(...args));
    }
}

export function create_code(name: string, src: string | undefined) {
    return async () => {
      if (!src || src.length == 0) {
          throw new Error(`missing code: ${name}`)
      }
      
      if (!src.includes('\n')) {
          const response = await fetch(src)
            if (!response.ok) {
              throw new Error(`${response.status} code: ${name}`);
          }
          return await response.text()
      }
  
      return src
    }    
}

export function create_emiter() {
    return new EventEmitter
}

export async function create_frontend(bus: EventEmitter, code: {game: (() => Promise<string>) | string}, canvas: HTMLCanvasElement, pause_reasons: Record<string, boolean>) {
  const cfg = {init: false}
  
  if (typeof code.game == 'function') {
    code.game = await code.game()
  }

  const bus_emit_resize = unpaused_call(pause_reasons, (width, height) => {
    bus.emit('resize', width, height)
  })

  return {
      native_callback_loop: (dt = 16) => {
        if (!is_paused(pause_reasons)) {
          bus.emit('pad')
          bus.emit('loop', dt)
        }
      },
      native_callback_draw: () => {
        if (!is_paused(pause_reasons)) {
          bus.emit('draw')
        }
      },
      native_callback_init: (width?: number, height?: number) => {
        if (!width || !height) {
          width = canvas.width
          height = canvas.height
        }
        if (!is_paused(pause_reasons)) {
          bus.emit('init', width, height, code.game)
        }
        cfg.init = true
      },
      native_callback_resize: (width: number, height: number) => {
        canvas.width = width
        canvas.height = height
        if (cfg.init) {
          bus_emit_resize(width, height);
        }
      },
      native_callback_keyboard: (key: string, value: boolean | number) => {
        if (!is_paused(pause_reasons)) {
          bus.emit('keyboard', key, value)
        }
      }
  };
}
