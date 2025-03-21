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

const alternative_keymaps: Record<string, typeof default_keymap> = {
    legacy: [
        [13, 'enter'],
        [38, 'up'],
        [37, 'left'],
        [40, 'down'],
        [39, 'right'],
        [403, 'red'],
        [404, 'green'],
        [405, 'yellow'],
        [406, 'blue'],
        [10009, 'enter'],
        ['KeyZ', 'red'],
        ['KeyX', 'green'],
        ['KeyC', 'yellow'],
        ['KeyV', 'blue'],
        ['Enter', 'enter'],
        ['ArrowUp', 'up'],
        ['ArrowDown', 'down'],
        ['ArrowLeft', 'left'],
        ['ArrowRight', 'right'],
    ]
}

export function keyboard_trigger(trigger: (key: string, value: number) => void, keymap: typeof default_keymap | string = default_keymap) {
    if (typeof keymap === 'string') {
        keymap = alternative_keymaps[keymap] ?? default_keymap
    }

    return (ev: KeyboardEvent) => {
        const key = keymap.find(key => [ev.code, ev.keyCode].includes(key[0]))
        if (key) {
            ev.preventDefault()
            trigger(key[1], Number(ev.type === 'keydown'))
        }
    }
}
