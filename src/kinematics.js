const {radToDegree} = require("./utils");
const { elbowOffset, shoulderOffset, upperLegLength, lowerLegLength } = require("../config").physical

const inversePositioning = (x, y, right, z = 0) => {
    const L = 2;
    const y_prime = -Math.sqrt((z + L) ** 2 + y ** 2);
    const thetaZ =
        Math.atan2(z + L, Math.abs(y)) - Math.atan2(L, Math.abs(y_prime));
    
    const a1 = upperLegLength;
    const a2 = lowerLegLength;

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
    let thetaShoulder = -theta1;
    let thetaElbow = thetaShoulder - theta2;
    let thetaHip;
    if (right) {
        thetaShoulder = 180 - radToDegree(thetaShoulder) + shoulderOffset;
        thetaElbow = 130 - radToDegree(thetaElbow) + elbowOffset;
        thetaHip = 90 - radToDegree(thetaZ);
    } else {
        thetaShoulder = radToDegree(thetaShoulder) - shoulderOffset;
        thetaElbow = 50 + radToDegree(thetaElbow) - elbowOffset;
        thetaHip = 90 + radToDegree(thetaZ);
    }

    //if (shoulder === 0) console.log("shoulder:",thetaShoulder,"elbow:",thetaElbow, "hip:", thetaHip);
    return { thetaShoulder, thetaElbow, thetaHip };
}

const applyMomentumToCurve3d = (momentum, curve3d) => {
    const trajectory = curve3d.map(point => ({
        x: point.x * momentum.longitudinal,
        y: point.y * momentum.lateral,
        z: point.z * momentum.vertical
    }));

    const x = trajectory.map(point => point.x);
    const y = trajectory.map(point => point.y); // swapped z and y to be same as python
    const z = trajectory.map(point => point.z);

    return { x, y, z }
}

const mapCoordsToLegs = (index, curvePoints) => {

    const { x, y, z } = curvePoints;
    const numPoints = x.length
    const i1 = index % numPoints;
    const i2 = (index + numPoints / 2) % numPoints;

    return {
        fl: {
            x: x[i2], y: y[i2] - 1, z: z[i2]
        },
        fr: {
            x: x[i1], y: y[i1] - 1, z: z[i1]
        },
        bl: {
            x: x[i1], y: y[i1] + 1
        },
        br: {
            x: x[i2], y: y[i2] + 2
        }
    }
}

module.exports = {
    inversePositioning,
    applyMomentumToCurve3d,
    mapCoordsToLegs
}