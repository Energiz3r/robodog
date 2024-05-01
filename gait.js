var {Bezier} = require("bezier-js");
var linspace = require("linspace");

const formatMemoryUsage = (data) => `${Math.round(data / 1024 / 1024 * 100) / 100} MB`;

class Gait {
    constructor(servoController, motors) {
        this.motors = motors
        this.servoController = servoController;
        this.upper_leg_length = 10;
        this.lower_leg_length = 10.5;
        this.writingServos = []
    }

    setAngle(motor_id, degrees) {
        if (!this.writingServos.includes(motor_id)) {
            this.writingServos.push(motor_id)
            const callback = () => {
                this.writingServos = this.writingServos.filter(id => id !== motor_id)
            }
            const servo = this.servoController.servo.find(servo => servo.channel === motor_id)
            servo.setAngle(degrees, callback);
        }
        // else {
        //     console.log("Tried to overwrite a servo")
        // }
    }

    radToDegree(rad) {
        return (rad * 180) / Math.PI;
    }

    calibrate() {
        this.setAngle(this.motors.FR_SHOULDER, 60);
        this.setAngle(this.motors.FR_ELBOW, 90);
        this.setAngle(this.motors.FR_HIP, 90);
        this.setAngle(this.motors.FL_SHOULDER, 120);
        this.setAngle(this.motors.FL_ELBOW, 90);
        this.setAngle(this.motors.FL_HIP, 90);
        this.setAngle(this.motors.BR_SHOULDER, 60);
        this.setAngle(this.motors.BR_ELBOW, 90);
        this.setAngle(this.motors.BR_HIP, 70); // unused
        this.setAngle(this.motors.BL_SHOULDER, 120);
        this.setAngle(this.motors.BL_ELBOW, 90);
        this.setAngle(this.motors.BL_HIP, 90); // unused
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

        //if (shoulder === 0) console.log("shoulder:",theta_shoulder,"elbow:",theta_elbow, "hip:", theta_hip);
        this.setAngle(shoulder, theta_shoulder);
        this.setAngle(elbow, theta_elbow);
        if (hip) {
            this.setAngle(hip, theta_hip);
        }
    }

    leg_position(self, leg_id, x, y, z = 0) {
        if (leg_id === 'FL')
            this.inversePositioning(this.motors.FL_SHOULDER, this.motors.FL_ELBOW, x, y, false, z, this.motors.FL_HIP)
        if (leg_id === 'FR')
            this.inversePositioning(this.motors.FR_SHOULDER, this.motors.FR_ELBOW, x, y, true, z, this.motors.FR_HIP)
        if (leg_id === 'BL')
            this.inversePositioning(this.motors.BL_SHOULDER, this.motors.BL_ELBOW, x, y, false)
        if (leg_id === 'BR')
            this.inversePositioning(this.motors.BR_SHOULDER, this.motors.BR_ELBOW, x, y, true)
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
            if (close) {
                console.log("Loop was terminated.")
                process.exit();
            }

            const difference = process.hrtime(lastLoopTime)[1];
            if (difference > 500 * 1000) { // 500 microseconds
                lastLoopTime = process.hrtime();
            } else {
                setTimeout(loop, 0)
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
            const y = trajectory.map(point => point.z); // swapped z and y to be same as python
            const z = trajectory.map(point => point.y);

            const i1 = index % 40;
            const i2 = (index + 20) % 40;

            this.inversePositioning(this.motors.FR_SHOULDER, this.motors.FR_ELBOW, x[i1], y[i1] - 1, true, z[i1], this.motors.FR_HIP);
            this.inversePositioning(this.motors.BR_SHOULDER, this.motors.BR_ELBOW, x[i2], y[i2] + 2, true);
            this.inversePositioning(this.motors.FL_SHOULDER, this.motors.FL_ELBOW, x[i2], y[i2] - 1, false, -z[i2], this.motors.FL_HIP);
            this.inversePositioning(this.motors.BL_SHOULDER, this.motors.BL_ELBOW, x[i1], y[i1] + 2, false);
            index++;

            setTimeout(loop, 35)
        }

        setInterval(() => {
            const memoryData = process.memoryUsage();
            console.log(`Heap total: ${formatMemoryUsage(memoryData.heapTotal)}`, close ? "NOT running" : "running");
        }, 1000)

        console.log("Running robot...")
        loop()
    }
}

module.exports = Gait;
