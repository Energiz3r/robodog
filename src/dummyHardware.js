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
    allChannelsOff(){
    }
    channelOn(channel){}
}

module.exports = { dummyI2C, dummyPCA }