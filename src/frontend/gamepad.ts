const default_gamepadmap: Record<string, Array<string>> = {
    pads: ['a', 'b', 'c', 'd', 'a', 'b', 'c', 'd', 'menu', 'menu', 'menu', 'menu', 'up', 'down', 'left', 'right'],
    axis: ['left', 'right', 'up', 'down', 'left', 'right', 'up', 'down', 'left', 'right', 'up', 'down']
}

const alternative_gamepadmaps: Record<string, typeof default_gamepadmap> = {
    legacy: {
        pads: ['red', 'green', 'yellow', 'blue', 'left', 'right', 'up', 'down', 'menu'],
        axis: ['left', 'right', 'up', 'down', 'left', 'right', 'up', 'down']
    }
}

export function gamepad_trigger(trigger: (button: string, value: number) => void, gamepadmap: typeof default_gamepadmap | string = default_gamepadmap) {
    if (typeof gamepadmap === 'string') {
        gamepadmap = alternative_gamepadmaps[gamepadmap] ?? default_gamepadmap
    }

    const previousStates: Array<number> = new Array(gamepadmap.pads.length).fill(0)
    const previousAxisStates: Array<number> = new Array(gamepadmap.axis.length).fill(0)
    const deadZone = 0.2

    return () => {
        const gamepads = (navigator?.getGamepads()) || []
        for (const gamepad of gamepads) {
            if (gamepad) {
                gamepadmap.pads.forEach((action, index) => {
                    const isPressed = gamepad.buttons[index]?.pressed ? 1 : 0
                    if (isPressed !== previousStates[index]) {
                        trigger(action, isPressed)
                        previousStates[index] = isPressed
                    }
                })

                gamepadmap.axis.forEach((action, index) => {
                    let isPressed = 0
                    let axisValue = gamepad.axes[Math.floor(index/2)]

                    if ((index & 1) && deadZone < axisValue) {
                        isPressed = 1
                    }
                    if (!(index & 1) && (-deadZone) > axisValue) {
                        isPressed = 1
                    }

                    if (isPressed !== previousAxisStates[index]) {
                        trigger(action, isPressed)
                        previousAxisStates[index] = isPressed
                    }
                })
            }
        }
    }
}
