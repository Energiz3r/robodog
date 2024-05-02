const { parentPort } = require('worker_threads');
const chalk = require('chalk');
const Gait = require("./gaitController");
const ServoController = require("./servoController");
const { calibrate } = require("../config");
const { inputController, keyPressHandler}  = require("./inputController");

parentPort.on('message', keyPressHandler);

const startRobot = () => {
    console.log(chalk.blue("Robodog starting..."));
    const servoController = new ServoController();
    const checkServoIsReady = () => {
        if (servoController.isReady) {
            console.log(chalk.gray("Servo controller ready!"))
            const gaitController = new Gait(servoController);
            gaitController.calibrate();
            if (!calibrate) {
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