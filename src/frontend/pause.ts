export function is_paused(pause_reasons: Record<string, boolean>) {
    return Object.values(pause_reasons).some(pause => pause)
}

export function pause(pause_reasons: Record<string, boolean>, motive = 'pause') {
    pause_reasons[motive] = true
}

export function resume(pause_reasons: Record<string, boolean>, motive?: string) {
    if (!motive || motive.length == 0) {
        return Object.keys(pause_reasons).forEach(motive => {
            pause_reasons[motive] = false
        })
    }
    pause_reasons[motive] = false
}

export function unpaused_call(pause_reasons: Record<string, boolean>, fn: (...args: unknown[]) => void) {
    let checkPaused: number;
  
    return (...args) => {
        clearInterval(checkPaused);

        if (!is_paused(pause_reasons)) {
        fn(...args);
        } else {
            checkPaused = setInterval(() => {
                if (!is_paused(pause_reasons)) {
                fn(...args);
                clearInterval(checkPaused);
                }
            }, 100);
        }
    };
}
