const { parentPort } = require('worker_threads');
var chalk = require('chalk');
const Gait = require("./gait.js");
const ServoController = require("./servoController");
const config = require("../config");
const { inputController, keyPressHandler}  = require("./inputController");

parentPort.on('message', keyPressHandler);

const startRobot = () => {
    console.log(chalk.blue("Robodog starting..."));
    const servoController = new ServoController(config.motors);
    const checkServoIsReady = () => {
        if (servoController.isReady) {
            console.log(chalk.gray("Servo controller ready!"))
            const gaitController = new Gait(servoController, config.motors);
            gaitController.calibrate();
            if (!config.calibrate) {
                gaitController.move(inputController);
            }
        } else {
            console.log(chalk.gray("Waiting for servo controller to be ready..."))
            setTimeout(checkServoIsReady, 250)
        }
    }
    checkServoIsReady();
}

startRobot();