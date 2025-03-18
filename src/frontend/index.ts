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
          throw new Error(`missing code: ${name}!`)
      }
      
      if (!src.includes('\n')) {
          const request = await fetch(src)
          return await request.text()
      }
  
      return src
    }    
}

export function create_emiter() {
    return new EventEmitter
}

export async function create_frontend(bus: EventEmitter, code: string | unknown, canvas: HTMLCanvasElement) {
  const cfg = {init: false}
  const game = await (typeof code === 'string'? (create_code('game.lua', code)()): code)

  return {
      native_callback_loop: (dt: number) => bus.emit('loop', dt),
      native_callback_draw: () => bus.emit('draw'),
      native_callback_init: (width?: number, height?: number) => {
        if (!width || !height) {
          width = canvas.width
          height = canvas.height
        }
        bus.emit('init', width, height, game)
        cfg.init = true
      },
      native_callback_resize: (width: number, height: number) => {
        canvas.width = width
        canvas.height = height
        if (cfg.init) {
          bus.emit('resize', width, height)
        }
      },
      native_callback_keyboard: (key: string, value: boolean) => bus.emit('keyboard', key, value)
  };
}
