const config = {
    port: 3000,
    accel: 0.10,
    loopDelayMs: 25,
    calibrate: false,
    motors: {
        FR_SHOULDER: {channel: 12, defaultAngle: 60, offset: -8},
        FR_ELBOW: {channel: 13, defaultAngle: 90, offset: 2},
        FR_HIP: {channel: 14, defaultAngle: 90, offset: -4},
        FL_SHOULDER: {channel: 8, defaultAngle: 120, offset: 6},
        FL_ELBOW: {channel: 9, defaultAngle: 90, offset: -9},
        FL_HIP: {channel: 10, defaultAngle: 90, offset: -2},
        BR_SHOULDER: {channel: 0, defaultAngle: 60, offset: 0},
        BR_ELBOW: {channel: 1, defaultAngle: 90, offset: 10},
        BR_HIP: {channel: 2, defaultAngle: 90, offset: 0}, // unused
        BL_SHOULDER: {channel: 4, defaultAngle: 120, offset: 8},
        BL_ELBOW: {channel: 5, defaultAngle: 90, offset: -3},
        BL_HIP: {channel: 6, defaultAngle: 90, offset: 0} // unused
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
