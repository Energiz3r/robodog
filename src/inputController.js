const config = require("../config");

let keysPressed = [];

const inputController = (momentum, accel = config.accel, bound = 4) => {
    if (keysPressed.length) {
        const isPressed = (key, keyExcepted) => {
            return keysPressed.includes(key) && !keysPressed.includes(keyExcepted)
        }
        //let isAnyPressed = false;
        if (isPressed("W", "S")) {
            momentum.longitudinal = Math.min(momentum.longitudinal + accel, bound)
            //isAnyPressed = true;
        } else if (isPressed("S", "W")) {
            momentum.longitudinal = Math.max(momentum.longitudinal - accel, -bound)
            //isAnyPressed = true
        }
        if (isPressed("A", "D")) {
            momentum.lateral = Math.max(momentum.lateral - accel, -bound)
            //isAnyPressed = true
        } else if (isPressed("D", "A")) {
            momentum.lateral = Math.min(momentum.lateral + accel, bound)
            //isAnyPressed = true
        }
        // if (isAnyPressed) {
        //     //momentum.vertical = Math.min(momentum.vertical + accel * 10, 1)
        // }
    } else {
        const decelerate = (val) => {
            const func = val > 0 ? Math.floor : Math.ceil;
            const mom = func(val * 100) / 100
            if (mom > 0) {
                if (mom - accel > 0) return mom - accel
                else return 0
            } else if (mom < 0) {
                if (mom + accel < 0) return mom + accel
                else return 0
            } else return 0
        }
        momentum.longitudinal = decelerate(momentum.longitudinal)
        momentum.lateral = decelerate(momentum.lateral)
        //momentum.vertical = decelerate(momentum.vertical)
    }
    console.log("momentum", momentum)
    return momentum
}

const keyPressHandler = (message) => {
    const {action, keyCode} = message;
    let keyChar = String.fromCharCode(keyCode);
    if (action === "keydown") {
        if (!keysPressed.includes(keyChar)) {
            console.log("Web UI: Keydown", keyChar)
            keysPressed.push(keyChar);
        }
    } else if (action === "keyup") {
        if (keysPressed.includes(keyChar)) {
            console.log("Web UI: Keyup", keyChar)
            keysPressed = keysPressed.filter(key => key !== keyChar);
        }
    }
}

module.exports = {inputController, keyPressHandler}