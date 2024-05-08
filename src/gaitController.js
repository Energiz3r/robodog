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

    setLegPosition(legId, x, y, z) {
        let right = false;
        if (legId === 'FR' || legId === "BR") right = true;
        const angles = inversePositioning(x, y, z, right)
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
            const {fl, fr, bl, br} = mapCoordsToLegs(Math.floor(index), curvePoints)

            //console.log("Loop! X:", Math.trunc(momentum.longitudinal), "Y:", Math.trunc(momentum.lateral), "Z:", Math.trunc(momentum.vertical))
            console.log(Math.floor(index), "BL/FR X:", Math.trunc(bl.x), Math.trunc(fr.x), "Y:", Math.trunc(bl.y), Math.trunc(fr.y))
            console.log(Math.floor(index), "BR/FL X:", Math.trunc(br.x), Math.trunc(fl.x), "Y:", Math.trunc(br.y), Math.trunc(fl.y))

            this.setLegPosition('FL', fl.x, fl.y, fl.z)
            this.setLegPosition('FR', fr.x, fr.y, fr.z)
            this.setLegPosition('BL', bl.x, bl.y, bl.z)
            this.setLegPosition('BR', br.x, br.y, br.z)

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
