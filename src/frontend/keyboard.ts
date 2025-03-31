export function keyboard_trigger(trigger: (key: string, value: number) => void, keymap: [string | number, string]) {
    return (ev: KeyboardEvent) => {
        const key = keymap.find(key => [ev.code, ev.keyCode].includes(key[0]))
        if (key) {
            ev.preventDefault()
            trigger(key[1], Number(ev.type === 'keydown'))
        }
    }
}
