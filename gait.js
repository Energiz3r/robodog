var {Bezier} = require("bezier-js");
var linspace = require("linspace");
var ServoController = require("./servoController.js");

const formatMemoryUsage = (data) => `${Math.round(data / 1024 / 1024 * 100) / 100} MB`;

const motor = {
    // identifies the corresponding pin location with the motor location
    FR_SHOULDER: 0,
    FR_ELBOW: 1,
    FR_HIP: 2,
    FL_SHOULDER: 3,
    FL_ELBOW: 4,
    FL_HIP: 5,
    BR_SHOULDER: 6,
    BR_ELBOW: 7,
    BL_SHOULDER: 8,
    BL_ELBOW: 9,
}

class Gait {
    constructor(servoController) {
        this.servoController = servoController;
        this.upper_leg_length = 10;
        this.lower_leg_length = 10.5;
    }

    setAngle(motor_id, degrees) {
        this.servoController.servo[motor_id].setAngle(degrees);
    }

    radToDegree(rad) {
        return (rad * 180) / Math.PI;
    }

    calibrate() {
        this.setAngle(motor.FR_SHOULDER, 60);
        this.setAngle(motor.FR_ELBOW, 90);
        this.setAngle(motor.FR_HIP, 90);
        this.setAngle(motor.FL_SHOULDER, 120);
        this.setAngle(motor.FL_ELBOW, 90);
        this.setAngle(motor.FL_HIP, 90);
        this.setAngle(motor.BR_SHOULDER, 60);
        this.setAngle(motor.BR_ELBOW, 90);
        this.setAngle(motor.BL_SHOULDER, 120);
        this.setAngle(motor.BL_ELBOW, 90);
    }

    inversePositioning(shoulder, elbow, x, y, right, z = 0, hip = null) {
        const L = 2;
        const y_prime = -Math.sqrt((z + L) ** 2 + y ** 2);
        const thetaz =
            Math.atan2(z + L, Math.abs(y)) - Math.atan2(L, Math.abs(y_prime));

        const elbow_offset = 20;
        const shoulder_offset = 10;
        const a1 = this.upper_leg_length;
        const a2 = this.lower_leg_length;

        let c2 = (x ** 2 + y_prime ** 2 - a1 ** 2 - a2 ** 2) / (2 * a1 * a2);
        let s2 = Math.sqrt(1 - c2 ** 2);
        let theta2 = Math.atan2(s2, c2);
        c2 = Math.cos(theta2);
        s2 = Math.sin(theta2);

        const c1 =
            (x * (a1 + a2 * c2) + y_prime * (a2 * s2)) / (x ** 2 + y_prime ** 2);
        const s1 =
            (y_prime * (a1 + a2 * c2) - x * (a2 * s2)) / (x ** 2 + y_prime ** 2);
        let theta1 = Math.atan2(s1, c1);
        // generate positions with respect to robot motors
        let theta_shoulder = -theta1;
        let theta_elbow = theta_shoulder - theta2;
        let theta_hip = 0;
        if (right) {
            theta_shoulder = 180 - this.radToDegree(theta_shoulder) + shoulder_offset;
            theta_elbow = 130 - this.radToDegree(theta_elbow) + elbow_offset;
            if (hip) {
                theta_hip = 90 - this.radToDegree(thetaz);
            }
        } else {
            theta_shoulder = this.radToDegree(theta_shoulder) - shoulder_offset;
            theta_elbow = 50 + this.radToDegree(theta_elbow) - elbow_offset;
            if (hip) {
                theta_hip = 90 + this.radToDegree(thetaz);
            }
        }

        //console.log("theta shoulder:",theta_shoulder,"\ttheta_elbow:",theta_elbow, "\ttheta_hip:", theta_hip);
        this.setAngle(shoulder, theta_shoulder);
        this.setAngle(elbow, theta_elbow);
        if (hip) {
            this.setAngle(hip, theta_hip);
        }
    }

    leg_position(self, leg_id, x, y, z = 0) {
        if (leg_id === 'FL')
            this.inversePositioning(motor.FL_SHOULDER, motor.FL_ELBOW, x, y, false, z, motor.FL_HIP)
        if (leg_id === 'FR')
            this.inversePositioning(motor.FR_SHOULDER, motor.FR_ELBOW, x, y, true, z, motor.FR_HIP)
        if (leg_id === 'BL')
            this.inversePositioning(motor.BL_SHOULDER, motor.BL_ELBOW, x, y, false)
        if (leg_id === 'BR')
            this.inversePositioning(motor.BR_SHOULDER, motor.BR_ELBOW, x, y, true)
    }

    move(controller) {
        const s_vals = linspace(0.0, 1.0, 20);

        const step_nodes = [
            {x: -1.0, y: -1.0, z: -15.0},
            {x: -1.0, y: -1.0, z: -10.0},
            {x: 1.0, y: 1.0, z: -10.0},
            {x: 1.0, y: 1.0, z: -15.0}
        ]
        const stepCurve = new Bezier(step_nodes);
        const step = s_vals.map(t => stepCurve.get(t));

        const slide_nodes = [
            {x: 1.0, y: 1.0, z: -15.0},
            {x: -1.0, y: -1.0, z: -15.0}
        ];
        const slideCurve = new Bezier(slide_nodes);
        const slide = s_vals.map(t => slideCurve.get(t));

        const motion = step.concat(slide)

        let close = false;
        let momentum = [0, 0, 1, 0];
        let index = 0;

        let lastLoopTime = process.hrtime();
        const loop = () => {
            if (close) return //process.exit();

            const difference = process.hrtime(lastLoopTime)[1];
            if (difference > 1000 * 1000) { // 500 microseconds
                lastLoopTime = process.hrtime();
            } else {
                return
            }

            momentum = controller(momentum);
            const trajectory = motion.map(point => ({
                x: point.x * momentum[0],
                y: point.y * momentum[1],
                z: point.z * momentum[2]
            }));

            if (momentum[3]) {
                console.log("momentum[3] was truthy!")
                close = true;
            }

            const x = trajectory.map(point => point.x);
            const y = trajectory.map(point => point.z); //intentionally swapped z and y to get same result as python
            const z = trajectory.map(point => point.y);

            const i1 = index % 40;
            const i2 = (index + 20) % 40;

            this.inversePositioning(motor.FR_SHOULDER, motor.FR_ELBOW, x[i1], y[i1] - 1, true, z[i1], motor.FR_HIP);
            this.inversePositioning(motor.BR_SHOULDER, motor.BR_ELBOW, x[i2], y[i2] + 2, true);
            this.inversePositioning(motor.FL_SHOULDER, motor.FL_ELBOW, x[i2], y[i2] - 1, false, -z[i2], motor.FL_HIP);
            this.inversePositioning(motor.BL_SHOULDER, motor.BL_ELBOW, x[i1], y[i1] + 2, false);
            index++;
            setTimeout(loop, 0);
        }
        loop()

        setInterval(() => {
            const memoryData = process.memoryUsage();
            console.log(`Heap total: ${formatMemoryUsage(memoryData.heapTotal)}`, close ? "NOT running" : "running");
        }, 1000)
    }
}

module.exports = Gait;
