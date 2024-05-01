const { parentPort } = require('worker_threads');
const Gait = require("./gait.js");
const ServoController = require("./servoController");
const config = require("./config");

let keysPressed = [];

parentPort.on('message', (message) => {
    const { action, keyCode } = message;
    let keyChar = String.fromCharCode(keyCode);
    if (action === "keydown") {
        if (!keysPressed.includes(keyChar)) {
            //console.log("Keydown", keyChar)
            keysPressed.push(keyChar);
        }
    } else if (action === "keyup") {
        if (keysPressed.includes(keyChar)) {
            console.log("Keyup", keyChar)
            keysPressed = keysPressed.filter(key => key !== keyChar);
        }
    }
});

const inputController = (momentum, accel= config.accel, bound=4) => {
    if (keysPressed.length) {
        const isPressed = (key, keyExcepted) => {
            return keysPressed.includes(key) && !keysPressed.includes(keyExcepted)
        }
        if (isPressed("W", "S"))
            momentum[0] = Math.min(momentum[0] + accel, bound)
        else if (isPressed("S", "W"))
            momentum[0] = Math.max(momentum[0] - accel, -bound)
        if (isPressed("A", "D"))
            momentum[1] = Math.max(momentum[1] - accel, -bound)
        else if (isPressed("D", "A"))
            momentum[1] = Math.min(momentum[1] + accel, bound)
    } else {
        const decelerate = (val) => {
            const func = val > 0 ? Math.floor : Math.ceil;
            const mom = func(val * 100) / 100
            if (mom > 0) {
                //console.log("mom - accel", mom - accel)
                if (mom - accel > 0) return mom - accel
                else return 0
            }
            else if (mom < 0) {
                if (mom + accel < 0) return mom + accel
                else return 0
            }
            else return 0
        }
        momentum[0] = decelerate(momentum[0])
        momentum[1] = decelerate(momentum[1])
    }
    console.log("momentum", momentum)
    return momentum
}

const startRobot = () => {
    console.log("Robodog started!");
    const servoController = new ServoController();
    const checkServoIsReady = () => {
        if (servoController.isReady) {
            console.log("Servos ready!")
            const gaitController = new Gait(servoController);
            gaitController.calibrate();
            if (!config.calibrationOnly) {
                gaitController.move(inputController);
            }
        } else {
            console.log("Waiting for servo ready...")
            setTimeout(checkServoIsReady, 250)
        }
    }
    checkServoIsReady();
}

startRobot();