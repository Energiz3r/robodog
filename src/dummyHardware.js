const dummyI2C = {
    openSync: (val) => {
    }
}

class dummyPCA {
    constructor(options, callback) {
        const bus = options.i2c
        callback(false)
    }
    setPulseRange(channel, low, hi, callback) {
    }
    setPulseLength(channel, pulseLength) {
    }
}

module.exports = { dummyI2C, dummyPCA }