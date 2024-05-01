const config = {
    accel: 0.20,
    speed: 26,
    calibrate: false,
    motors: {
        // identifies the corresponding pin location with the motor location
        FR_SHOULDER: 12,
        FR_ELBOW: 13,
        FR_HIP: 14,
        FL_SHOULDER: 8,
        FL_ELBOW: 9,
        FL_HIP: 10,
        BR_SHOULDER: 4,
        BR_ELBOW: 5,
        BR_HIP: 6, // unused
        BL_SHOULDER: 0,
        BL_ELBOW: 1,
        BL_HIP: 2 // unused
    }
}

module.exports = config