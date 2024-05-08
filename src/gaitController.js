const chalk = require('chalk');
const {motors, loopDelayMs} = require("../config");
const {inversePositioning, applyMomentumToCurve3d, mapCoordsToLegs} = require("./kinematics");
const basicGait = require("./gaits/basic");

class GaitController {
    constructor(servoController) {
        this.servoController = servoController;
    }

    calibrate() {
        Object.keys(motors).forEach(key => {
            this.servoController.setAngle(motors[key].channel, motors[key].defaultAngle)
        })
    }

    setLegPosition(legId, angles) {
        this.servoController.setAngle(motors[`${legId}_SHOULDER`].channel, angles.thetaShoulder);
        this.servoController.setAngle(motors[`${legId}_ELBOW`].channel, angles.thetaElbow);
        this.servoController.setAngle(motors[`${legId}_HIP`].channel, angles.thetaHip);
    }

    move(controller) {

        let shouldKillProcess = false;
        let momentum = {longitudinal: 0, lateral: 0, vertical: 1, halted: false};
        let index = 0;

        const loop = () => {

            if (shouldKillProcess) {
                console.log("Loop was terminated.")
                process.exit();
            }

            momentum = controller(momentum);

            if (momentum.halted) {
                if (this.servoController.isPowerOn) {
                    console.log("Power OFF")
                    this.servoController.setPower(false)
                }
                setTimeout(loop, loopDelayMs)
                return
            } else {
                if (!this.servoController.isPowerOn) {
                    console.log("Power ON")
                    this.servoController.setPower(true)
                }
            }

            const curvePoints = applyMomentumToCurve3d(momentum, basicGait)
            const {fr, fl, br, bl} = mapCoordsToLegs(Math.floor(index), curvePoints)

            const frAngles = inversePositioning(fr, false);
            const flAngles = inversePositioning(fl, true);
            const brAngles = inversePositioning(br, false);
            const blAngles = inversePositioning(bl, true);

            this.setLegPosition('FR', frAngles)
            this.setLegPosition('FL', flAngles)
            this.setLegPosition('BR', brAngles)
            this.setLegPosition('BL', blAngles)

            index = index +
                Math.max(
                    Math.max(
                        Math.abs(momentum.longitudinal),
                        Math.abs(momentum.lateral),
                    ) / 4,
                    0.1,
                )
            if (index >= curvePoints.x.length) index = 0;
            setTimeout(loop, loopDelayMs)
        }

        console.log(chalk.greenBright("Robodog is running! 🐕"))
        loop()
    }
}

module.exports = GaitController;
