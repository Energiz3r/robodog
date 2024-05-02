var chalk = require('chalk');
const config = require('../config');

let i2cBus;
let Pca9685Driver;
let pca9685ODevice;

const mapNumber = (number, in_min, in_max, out_min, out_max) => {
    return (number - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}



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
    isReady = false;

    constructor(channel) {
        this.channel = channel;
    }

    init() {
        pca9685ODevice.setPulseRange(this.channel, 500, 2500)
        this.isReady = true;
    }

    setAngle(degrees, callback) {
        const pulseLength = mapNumber(degrees, 0, 180, 500, 2500)
        pca9685ODevice.setPulseLength(this.channel, pulseLength, 2500, callback)
    }
}

class ServoController {
    servo = [];
    isReady = false;

    constructor(motors) {
        this.servo = Object.keys(motors).map((key) => {
            return new Servo(motors[key])
        });
        this.initialize().then(() => {
            this.servo.forEach(servo => servo.init())
            this.isReady = true;
        }).catch(err => {
            console.error("Error initializing PCA9685!", err);
            process.exit(-1);
        })
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
