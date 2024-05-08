const config = require("../config");

let keysPressed = [];

const decelerate = (val, accel) => {
    const func = val > 0 ? Math.floor : Math.ceil;
    const mom = func(val * 100) / 100;
    if (mom > 0) {
        if (mom - accel > 0) return mom - accel;
        else return 0;
    } else if (mom < 0) {
        if (mom + accel < 0) return mom + accel;
        else return 0;
    } else return 0;
};


const inputController = (
    momentum,
    accel = config.accel,
    bound = 4,
) => {
    const isPressed = (key, keyExcepted) => {
        if (!keysPressed?.length) return false
        if (keyExcepted) {
            return keysPressed.includes(key) && !keysPressed.includes(keyExcepted);
        } else {
            return keysPressed.includes(key);
        }
    };

    if (isPressed("W") || isPressed("S")) {
        if (isPressed("W", "S")) {
            momentum.longitudinal = Math.min(momentum.longitudinal + accel, bound);
        } else if (isPressed("S", "W")) {
            momentum.longitudinal = Math.max(momentum.longitudinal - accel, -bound);
        }
    } else {
        momentum.longitudinal = decelerate(momentum.longitudinal, accel);
    }

    if (isPressed("A") || isPressed("D")) {
        if (isPressed("A", "D")) {
            momentum.lateral = Math.max(momentum.lateral - accel, -bound);
        } else if (isPressed("D", "A")) {
            momentum.lateral = Math.min(momentum.lateral + accel, bound);
        }
    } else {
        momentum.lateral = decelerate(momentum.lateral, accel);
    }

    if (isPressed("Q", "E")) {
        momentum.vertical = Math.max(momentum.vertical - 0.05, 0.5);
    } else if (momentum.vertical < 1) {
        momentum.vertical = Math.min(momentum.vertical + 0.05, 1);
    }

    if (isPressed("E", "Q")) {
        momentum.vertical = Math.max(momentum.vertical + 0.05, 1.5);
    } else if (momentum.vertical > 1)  {
        momentum.vertical = Math.min(momentum.vertical - 0.05, 1);
    }

    return momentum;
};

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