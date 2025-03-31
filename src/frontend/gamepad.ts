export function gamepad_trigger(trigger: (button: string, value: number) => void, gamepadmap: {axis: Array<string>, pads: Array<string>}) {
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
