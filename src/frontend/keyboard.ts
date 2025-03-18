const default_keymap: Array<[string | number, string]> = [
    [13, 'a'],
    [38, 'up'],
    [37, 'left'],
    [40, 'down'],
    [39, 'right'],
    [403, 'a'],
    [404, 'b'],
    [405, 'c'],
    [406, 'd'],
    [10009, 'menu'],
    ['KeyZ', 'a'],
    ['KeyX', 'b'],
    ['KeyC', 'c'],
    ['KeyV', 'd'],
    ['Enter', 'a'],
    ['ArrowUp', 'up'],
    ['ArrowDown', 'down'],
    ['ArrowLeft', 'left'],
    ['ArrowRight', 'right'],
    ['ShiftLeft', 'menu'],
]

export function keyboard_trigger(trigger: (key: string, value: boolean) => void, keymap: typeof default_keymap = default_keymap) {
    return (ev: KeyboardEvent) => {
        const key = keymap.find(key => [ev.code, ev.keyCode].includes(key[0]))
        if (key) {
            ev.preventDefault()
            trigger(key[1], ev.type === 'keydown')
        }
    }
}
