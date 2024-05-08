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
    setPulseLength(channel, pulseLength, out_max, callback) {
        console.log("Set pulse length")
        setTimeout(() => callback(), 3)
    }
    allChannelsOff(){
    }
    channelOn(channel){}
}

module.exports = { dummyI2C, dummyPCA }