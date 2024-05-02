const chalk = require('chalk');
const { motors, loopDelayMs } = require("../config");
const { inversePositioning, applyMomentumToCurve3d, mapCoordsToLegs } = require("./kinematics");
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

    setLegPosition(legId, x, y, z = 0) {
        let angles;
        if (legId === 'FL')
            angles = inversePositioning(x, y, false, z)
        if (legId === 'FR')
            angles = inversePositioning(x, y, true, z)
        if (legId === 'BL')
            angles = inversePositioning(x, y, false)
        if (legId === 'BR')
            angles = inversePositioning(x, y, true)
        this.servoController.setAngle(motors[`${legId}_SHOULDER`].channel, angles.thetaShoulder);
        this.servoController.setAngle(motors[`${legId}_ELBOW`].channel, angles.thetaElbow);
        if (legId === "FL" || legId === "FR") {
            this.servoController.setAngle(motors[`${legId}_HIP`].channel, angles.thetaHip);
        }
    }

    move(controller) {

        let shouldKillProcess = false;
        let momentum = { longitudinal: 0, lateral: 0, vertical: 0, halted: false };
        let index = 0;

        const loop = () => {
            if (shouldKillProcess) {
                console.log("Loop was terminated.")
                process.exit();
            }

            if (momentum.halted) {
                setTimeout(loop, loopDelayMs)
                return
            }

            momentum = controller(momentum);
            const curvePoints = applyMomentumToCurve3d(momentum, basicGait)
            const { fl, fr, bl, br } = mapCoordsToLegs(index, curvePoints)

            this.setLegPosition('FL', fl.x, fl.y, fl.z)
            this.setLegPosition('FR', fr.x, fr.y, fr.z)
            this.setLegPosition('BL', bl.x, bl.y)
            this.setLegPosition('BR', br.x, br.y)

            index++;
            if (index === curvePoints.x.length) index = 0;
            setTimeout(loop, loopDelayMs)
        }

        console.log(chalk.greenBright("Robodog is running! 🐕"))
        loop()
    }
}

module.exports = GaitController;