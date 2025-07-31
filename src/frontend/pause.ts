export function is_paused(pause_reasons: Record<string, boolean>) {
    for (var key in pause_reasons) {
        if (pause_reasons[key]) return true;
    }
    return false;
}

export function pause(pause_reasons: Record<string, boolean>, motive = 'pause') {
    pause_reasons[motive] = true
}

export function resume(pause_reasons: Record<string, boolean>, motive?: string) {
    if (motive && motive.length > 0) {
        pause_reasons[motive] = false
        return;
    }
    for (var key in pause_reasons) {
        pause_reasons[key] = false
    }       
}

export function unpaused_call(pause_reasons: Record<string, boolean>, fn: (...args: unknown[]) => void) {
    let checkPaused: ReturnType<typeof setInterval>
  
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
