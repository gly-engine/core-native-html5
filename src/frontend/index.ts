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

export function create_lua_code(engine_code: string | undefined) {
    return async () => {
        if (!engine_code || engine_code.length == 0) {
            throw new Error('missing engine!')
        }
        
        if (!engine_code.includes('\n')) {
            const request = await fetch(engine_code)
            return await request.text()
        }
    
        return engine_code
    }    
}

export function create_emiter() {
    return new EventEmitter
}

export function create_frontend(bus: EventEmitter) {
    return {
        native_callback_loop: (dt: number) => bus.emit('loop', dt),
        native_callback_draw: () => bus.emit('draw'),
        native_callback_init: (width: number, height: number, game: unknown) => bus.emit('init', width, height, game),
        native_callback_keyboard: (key: string, value: boolean) => bus.emit('keyboard', key, value)
    };
}
