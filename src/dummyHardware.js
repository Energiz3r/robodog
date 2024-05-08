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
        setTimeout(() => callback(), 3)
    }
    setPulseLength(channel, pulseLength, out_max, callback) {
        setTimeout(() => callback(), 3)
    }
    allChannelsOff(){
    }
    channelOn(channel){}
}

module.exports = { dummyI2C, dummyPCA }