const config = {
    port: 3000,
    accel: 0.20,
    loopDelayMs: 20,
    calibrate: false,
    motors: {
        FR_SHOULDER: {channel: 12, defaultAngle: 60, offset: 0},
        FR_ELBOW: {channel: 13, defaultAngle: 90, offset: 0},
        FR_HIP: {channel: 14, defaultAngle: 90, offset: 0},
        FL_SHOULDER: {channel: 8, defaultAngle: 120, offset: 0},
        FL_ELBOW: {channel: 9, defaultAngle: 90, offset: 0},
        FL_HIP: {channel: 10, defaultAngle: 90, offset: 0},
        BR_SHOULDER: {channel: 4, defaultAngle: 60, offset: 0},
        BR_ELBOW: {channel: 5, defaultAngle: 90, offset: 0},
        BR_HIP: {channel: 6, defaultAngle: 90, offset: 0}, // unused
        BL_SHOULDER: {channel: 0, defaultAngle: 120, offset: 0},
        BL_ELBOW: {channel: 1, defaultAngle: 90, offset: 0},
        BL_HIP: {channel: 2, defaultAngle: 90, offset: 0} // unused
    },
    pca9685: {
        i2cDevice: 0,
        address: 0x40,
        frequency: 50,
        debug: false
    },
    physical: {
        elbowOffset: 20,
        shoulderOffset: 10,
        upperLegLength: 10,
        lowerLegLength: 10
    }
}

module.exports = config