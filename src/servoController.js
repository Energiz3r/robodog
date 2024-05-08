const chalk = require('chalk');
const config = require('../config');
const utils = require('./utils');

let i2cBus;
let Pca9685Driver;
let pca9685ODevice;

// load dummy drivers if modules aren't installed
try {
    i2cBus = require('i2c-bus');
    Pca9685Driver = require('pca9685').Pca9685Driver;
    console.log(chalk.green('Hardware libraries OK!'));
} catch (error) {
    console.log(chalk.yellowBright('Hardware libraries not available! Simulating servo output.'));
    i2cBus = require('./dummyHardware').dummyI2C
    Pca9685Driver = require('./dummyHardware').dummyPCA
}

const pca9685Options = {
    i2c: i2cBus.openSync(config.pca9685.i2cDevice),
    address: config.pca9685.address,
    frequency: config.pca9685.frequency,
    debug: config.pca9685.debug
};

class Servo {

    channel = 0;
    offset = 0;
    isReady = false;
    isBusy = false;

    constructor(motor) {
        this.channel = motor.channel;
        this.offset = motor.offset;
    }

    init() {
        pca9685ODevice.setPulseRange(this.channel, 500, 2500)
        this.isReady = true;
    }

    setAngle(degrees) {
        if (this.channel === 13) {
            console.log(degrees, ",", this.offset)
        }
        // writing to the servo fast repeatedly without waiting until the callback is resolved causes memory overflow
        if (!this.isBusy) {
            this.isBusy = true;
            let newDegrees = degrees + this.offset
            if (newDegrees < 0) newDegrees = 0;
            if (newDegrees > 360) newDegrees = 360;
            const pulseLength = utils.mapNumber(newDegrees, 0, 180, 500, 2500)
            pca9685ODevice.setPulseLength(this.channel, pulseLength, 2500, () => this.isBusy = false)
        }
    }
}

class ServoController {
    servos = [];
    isReady = false;
    isPowerOn = true;

    constructor() {
        this.servos = Object.keys(config.motors).map((key) => {
            return new Servo(config.motors[key])
        });
        this.initialize().then(() => {
            this.servos.forEach(servo => servo.init())
            this.isReady = true;
        }).catch(err => {
            console.error("Error initializing PCA9685!", err);
            process.exit(-1);
        })
    }

    setAngle(channel, degrees){
        if (this.isPowerOn) {
            const servo = this.servos.find(servo => servo.channel === channel)
            servo.setAngle(degrees);
        }
    }

    setPower(powerOn) {
        if (powerOn) {
            this.isPowerOn = true
            this.servos.forEach(servo => pca9685ODevice.channelOn(servo.channel))
        } else {
            this.isPowerOn = false
            pca9685ODevice.allChannelsOff()
        }
    }

    initialize() {
        return new Promise((resolve, reject) => {
            pca9685ODevice = new Pca9685Driver(pca9685Options, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }
}

module.exports = ServoController;
